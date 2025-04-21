<?php
// PhonePe Payment Handler

// Set headers to allow cross-origin requests from your domain
header("Access-Control-Allow-Origin: *"); // In production, specify your domain instead of *
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Added OPTIONS for preflight requests
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just return 200 OK for preflight requests
    http_response_code(200);
    exit;
}

// PhonePe API credentials
$api_key = '65bea3ee-3d0b-4bee-a1de-463c0f51a974';
$merchant_id = 'MUSKURAHATFOUNDATION';

// Check if this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    // For development/testing only: provide a mock response
    if (isset($_GET['test']) && $_GET['test'] === 'true') {
        // Mock response for testing
        echo json_encode([
            'success' => true,
            'data' => [
                'merchantId' => $merchant_id,
                'merchantTransactionId' => 'MSK' . time(),
                'instrumentResponse' => [
                    'redirectInfo' => [
                        'url' => 'https://phonepe.com/test-redirect?txnId=MSK' . time()
                    ]
                ]
            ]
        ]);
        exit;
    }
    
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON data from request body
$request_data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($request_data['amount']) || empty($request_data['name']) || 
    empty($request_data['email']) || empty($request_data['phone'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    // Generate transaction ID
    $transaction_id = 'MSK' . time();
    $user_id = 'MUSER' . time();
    
    // Create payment request
    $amount = (int)($request_data['amount'] * 100); // Convert to paise
    
    $payment_data = [
        'merchantId' => $merchant_id,
        'merchantTransactionId' => $transaction_id,
        'merchantUserId' => $user_id,
        'amount' => $amount,
        'redirectUrl' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]" . '?txnId=' . $transaction_id,
        'redirectMode' => 'REDIRECT',
        'mobileNumber' => $request_data['phone'],
        'paymentInstrument' => [
            'type' => 'PAY_PAGE'
        ]
    ];
    
    // Convert payment data to JSON
    $payload = json_encode($payment_data);
    
    // For local development/testing
    if (isset($_GET['mock']) && $_GET['mock'] === 'true') {
        // Return a mock success response for testing
        echo json_encode([
            'success' => true,
            'data' => [
                'merchantId' => $merchant_id,
                'merchantTransactionId' => $transaction_id,
                'instrumentResponse' => [
                    'redirectInfo' => [
                        'url' => 'index.html?txnId=' . $transaction_id . '&status=SUCCESS'
                    ]
                ]
            ]
        ]);
        exit;
    }
    
    // Generate checksum
    $checksum = generateChecksum($payload, $api_key);
    
    // Call PhonePe API
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => 'https://api.phonepe.com/apis/hermes/pg/v1/pay',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'X-VERIFY: ' . $checksum,
            'Authorization: Bearer ' . $api_key
        ],
    ]);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    
    curl_close($curl);
    
    if ($err) {
        throw new Exception('cURL Error: ' . $err);
    }
    
    // Return PhonePe response
    echo $response;
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

/**
 * Generate checksum for PhonePe API
 */
function generateChecksum($payload, $salt) {
    // Format: sha256(payload + apiEndpoint + salt) + "###" + saltIndex
    $string = $payload . "/pg/v1/pay" . $salt;
    $sha256 = hash('sha256', $string);
    
    return $sha256 . '###1';
} 