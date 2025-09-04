// API Configuration
const API_CONFIG = {
    // Instagram APIs
    instagram: {
        basicDisplayAPI: {
            clientId: 'your_app_id',
            clientSecret: 'your_app_secret',
            redirectUri: 'https://obieda-hussien.github.io/Insta-growth-service/auth',
            scope: 'user_profile,user_media'
        },
        rapidAPIs: [
            {
                url: 'https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile',
                key: 'your_rapidapi_key_1',
                host: 'instagram-bulk-profile-scrapper.p.rapidapi.com'
            },
            {
                url: 'https://instagram-statistics-api.p.rapidapi.com/api/instagram',
                key: 'your_rapidapi_key_2', 
                host: 'instagram-statistics-api.p.rapidapi.com'
            },
            {
                url: 'https://instagram-scraper-2022.p.rapidapi.com/ig/profile_info',
                key: 'your_rapidapi_key_3',
                host: 'instagram-scraper-2022.p.rapidapi.com'
            }
        ],
        publicEndpoints: [
            'https://www.instagram.com/{username}/?__a=1&__d=dis',
            'https://i.instagram.com/api/v1/users/web_profile_info/?username={username}'
        ]
    },
    
    // GitHub OAuth for authentication
    github: {
        clientId: 'your_github_app_id',
        scope: 'user:email',
        redirectUri: 'https://obieda-hussien.github.io/Insta-growth-service/dashboard.html'
    },
    
    // Storage APIs
    storage: {
        githubGists: {
            token: 'your_github_token',
            apiUrl: 'https://api.github.com/gists'
        },
        jsonBin: {
            key: 'your_jsonbin_key',
            url: 'https://api.jsonbin.io/v3/b'
        },
        firebase: {
            apiKey: 'your_firebase_key',
            authDomain: 'your-project.firebaseapp.com',
            databaseURL: 'https://your-project.firebaseio.com',
            projectId: 'your-project'
        }
    },
    
    // Rate limiting settings
    rateLimits: {
        instagram: {
            requestsPerHour: 100,
            requestsPerDay: 1000
        },
        github: {
            requestsPerHour: 5000
        }
    },
    
    // Proxy services for bypassing CORS
    proxies: [
        'https://api.allorigins.win/get?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://api.codetabs.com/v1/proxy?quest='
    ]
};

// Personal mode - direct access without authentication
const DEMO_MODE = false;
const PERSONAL_MODE = true;

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
} else {
    window.API_CONFIG = API_CONFIG;
    window.DEMO_MODE = DEMO_MODE;
    window.PERSONAL_MODE = PERSONAL_MODE;
}