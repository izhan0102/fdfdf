/**
 * Firebase Fallback
 * This module provides mock implementations of Firebase services for development/testing
 * when the actual Firebase services are not available.
 */

// This script will run and add fallback Firebase implementation to window
// only if the real Firebase fails to load
(function() {
    console.log('Firebase fallback module loaded and ready if needed');
    
    // Wait for main script to try loading Firebase first
    window.addEventListener('load', function() {
        // If Firebase auth flag is not set after 3 seconds, use our fallback
        setTimeout(function() {
            if (!window.firebaseAuthReady) {
                console.log('Firebase did not initialize properly, using fallback implementation');
                setupMockFirebase();
            }
        }, 3000);
    });
    
    function setupMockFirebase() {
        // Mock Firebase App
        window.mockFirebaseApp = {
            name: 'mock-firebase-app',
            options: {
                projectId: 'mock-project',
                databaseURL: 'mock-db'
            },
            automaticDataCollectionEnabled: false
        };
        
        // Mock Analytics
        window.mockFirebaseAnalytics = {
            app: window.mockFirebaseApp,
            logEvent: function(eventName, eventParams) {
                console.log('Mock Analytics event:', eventName, eventParams);
            }
        };
        
        // Mock Database
        window.mockFirebaseDatabase = {
            app: window.mockFirebaseApp,
            ref: function(path) {
                return {
                    path: path,
                    set: function(data) {
                        console.log('Mock database write to', path, data);
                        return Promise.resolve();
                    },
                    update: function(data) {
                        console.log('Mock database update at', path, data);
                        return Promise.resolve();
                    },
                    remove: function() {
                        console.log('Mock database remove at', path);
                        return Promise.resolve();
                    },
                    push: function() {
                        const id = 'mock-key-' + Date.now();
                        console.log('Mock database push at', path, 'with key', id);
                        return {
                            key: id,
                            set: function(data) {
                                console.log('Mock database write to pushed ref', path + '/' + id, data);
                                return Promise.resolve();
                            }
                        };
                    }
                };
            }
        };
        
        // Set the global flag so the application knows Firebase is "ready"
        window.firebaseAuthReady = true;
        
        console.log('Firebase fallback is active');
    }
})(); 