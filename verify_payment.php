<?php
// PhonePe Payment Verification Handler

// Set headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // In production, specify your domain instead of *
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just return 200 OK for preflight requests
    http_response_code(200);
    exit;
}

// PhonePe API credentials
$api_key = '65bea3ee-3d0b-4bee-a1de-463c0f51a974';
$merchant_id = 'MUSKURAHATFOUNDATION';

// Get transaction ID from query string
$txn_id = isset($_GET['txnId']) ? $_GET['txnId'] : '';

if (empty($txn_id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing transaction ID']);
    exit;
}

// For development/testing, provide a mock success response
if (isset($_GET['mock']) && $_GET['mock'] === 'true') {
    echo json_encode([
        'success' => true,
        'data' => [
            'merchantTransactionId' => $txn_id,
            'amount' => 10000, // 100 rupees in paise
            'transactionId' => $txn_id
        ]
    ]);
    exit;
}

try {
    // Call PhonePe API to check payment status
    $curl = curl_init();
    
    $url = "https://api.phonepe.com/apis/hermes/pg/v1/status/{$merchant_id}/{$txn_id}";
    
    // Generate checksum
    $checksum = generateChecksum("{$merchant_id}/{$txn_id}", $api_key);
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CUSTOMREQUEST => 'GET',
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'X-VERIFY: ' . $checksum,
            'X-MERCHANT-ID: ' . $merchant_id,
            'Authorization: Bearer ' . $api_key
        ],
    ]);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    
    curl_close($curl);
    
    if ($err) {
        throw new Exception('cURL Error: ' . $err);
    }
    
    $result = json_decode($response, true);
    
    // Create logs directory if it doesn't exist
    if (!file_exists('logs')) {
        mkdir('logs', 0755, true);
    }
    
    // Log payment details to file (for debugging purposes)
    file_put_contents('logs/payment_logs.txt', date('Y-m-d H:i:s') . ' - ' . $response . PHP_EOL, FILE_APPEND);
    
    // Return success status
    if (isset($result['success']) && $result['success'] === true) {
        echo json_encode([
            'success' => true,
            'data' => [
                'status' => $result['data']['merchantTransactionId'],
                'amount' => isset($result['data']['amount']) ? $result['data']['amount'] / 100 : 0,
                'transactionId' => $txn_id
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Payment verification failed',
            'message' => isset($result['message']) ? $result['message'] : 'Unknown error'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

/**
 * Generate checksum for PhonePe API
 */
function generateChecksum($payload, $salt) {
    // Format: sha256(payload + apiEndpoint + salt) + "###" + saltIndex
    $string = $payload . "/pg/v1/status" . $salt;
    $sha256 = hash('sha256', $string);
    
    return $sha256 . '###1';
} 