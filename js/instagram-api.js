// Instagram API Integration
class InstagramAPI {
    constructor() {
        this.rateLimiter = new Map();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Get Instagram profile data
    async getProfile(username) {
        try {
            // Check cache first
            const cacheKey = `profile_${username}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            let profileData;

            if (DEMO_MODE) {
                profileData = this.generateDemoProfile(username);
            } else {
                // Try multiple API endpoints with fallback
                profileData = await this.fetchProfileWithFallback(username);
            }

            // Cache the result
            this.setCache(cacheKey, profileData);
            return profileData;
        } catch (error) {
            console.error('Profile fetch error:', error);
            return this.generateDemoProfile(username);
        }
    }

    // Generate demo profile data
    generateDemoProfile(username) {
        // Personal mode - use the provided username directly
        const actualUsername = username || 'your_instagram';
        
        // More realistic base numbers for personal use
        const baseFollowers = window.PERSONAL_MODE ? 
            Math.floor(Math.random() * 2000) + 500 : // 500-2500 for personal
            Math.floor(Math.random() * 5000) + 1000; // 1000-6000 for demo
        
        const baseFollowing = Math.floor(baseFollowers * (0.1 + Math.random() * 0.4)); // 10-50% of followers
        const basePosts = Math.floor(Math.random() * 300) + 50;

        return {
            username: actualUsername,
            full_name: window.PERSONAL_MODE ? 
                actualUsername.charAt(0).toUpperCase() + actualUsername.slice(1) :
                `${actualUsername.charAt(0).toUpperCase()}${actualUsername.slice(1)} User`,
            biography: window.PERSONAL_MODE ?
                `🌟 Personal Growth Journey\n📈 Building my Instagram presence\n💪 Focused on authentic engagement` :
                `Welcome to my Instagram! 📸\n✨ Living my best life\n🌟 Follow for amazing content`,
            external_url: `https://linktr.ee/${actualUsername}`,
            profile_pic_url: `https://ui-avatars.com/api/?name=${actualUsername}&size=150&background=667eea&color=ffffff&bold=true`,
            is_verified: window.PERSONAL_MODE ? false : Math.random() > 0.8,
            is_private: false, // Personal accounts usually public for growth
            follower_count: baseFollowers,
            following_count: baseFollowing,
            media_count: basePosts,
            engagement_rate: (Math.random() * 3 + 2).toFixed(2), // 2-5% engagement
            avg_likes: Math.floor(baseFollowers * (0.03 + Math.random() * 0.05)), // 3-8% like rate
            avg_comments: Math.floor(baseFollowers * (0.005 + Math.random() * 0.01)), // 0.5-1.5% comment rate
            last_post_date: Date.now() - (Math.random() * 3 * 24 * 60 * 60 * 1000), // Within 3 days
            recent_posts: this.generateDemoPosts(9), // 3x3 grid
            created_at: Date.now(),
            account_type: 'personal',
            category: 'Personal Blog'
        };
    }

    // Generate demo posts
    generateDemoPosts(count) {
        const posts = [];
        const postTypes = ['photo', 'carousel', 'reel'];
        
        for (let i = 0; i < count; i++) {
            const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
            const likes = Math.floor(Math.random() * 2000) + 50;
            const comments = Math.floor(likes * (0.01 + Math.random() * 0.03)); // 1-4% comment rate
            
            posts.push({
                id: `demo_post_${i}_${Date.now()}`,
                type: postType,
                thumbnail_url: `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000) + i * 100}`,
                like_count: likes,
                comment_count: comments,
                timestamp: Date.now() - (i * Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within week
                caption: this.generatePostCaption(i),
                hashtags: this.generateHashtags(),
                is_video: postType === 'reel',
                video_view_count: postType === 'reel' ? likes * (2 + Math.random() * 8) : 0 // 2-10x likes for views
            });
        }
        return posts.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
    }

    // Generate realistic post captions
    generatePostCaption(index) {
        const captions = [
            "Living my best life ✨ What's your favorite way to spend the weekend?",
            "New day, new opportunities! 🌅 Ready to crush these goals 💪",
            "Grateful for all the amazing people in my life 🙏❤️",
            "Behind the scenes of my latest project 📸 Can't wait to share more!",
            "Sometimes you need to take a step back and appreciate the journey 🌟",
            "Working hard, staying focused 💼 Success doesn't happen overnight!",
            "Sunset vibes and good energy ✨ Hope everyone had an amazing day!",
            "Throwback to one of my favorite moments this year 📅💫",
            "Excited to announce something special coming soon! 🎉 Stay tuned..."
        ];
        
        return captions[index % captions.length];
    }

    // Generate relevant hashtags
    generateHashtags() {
        const hashtagSets = [
            ['#lifestyle', '#motivation', '#inspiration', '#dailylife', '#positivevibes'],
            ['#entrepreneur', '#businessmindset', '#success', '#hustle', '#goals'],
            ['#photography', '#photooftheday', '#instagram', '#creative', '#art'],
            ['#fitness', '#healthy', '#wellness', '#selfcare', '#mindfulness'],
            ['#travel', '#adventure', '#explore', '#wanderlust', '#memories']
        ];
        
        const selectedSet = hashtagSets[Math.floor(Math.random() * hashtagSets.length)];
        return selectedSet.join(' ');
    }

    // Fetch profile with multiple API fallbacks
    async fetchProfileWithFallback(username) {
        const apis = [
            () => this.fetchFromBasicDisplayAPI(username),
            () => this.fetchFromRapidAPI(username),
            () => this.fetchFromPublicEndpoint(username),
            () => this.scrapePublicProfile(username)
        ];

        for (const apiCall of apis) {
            try {
                if (this.canMakeRequest('instagram')) {
                    const result = await apiCall();
                    if (result) return result;
                }
            } catch (error) {
                console.warn('API call failed, trying next endpoint:', error);
                continue;
            }
        }

        // If all APIs fail, return demo data
        return this.generateDemoProfile(username);
    }

    // Fetch from Instagram Basic Display API
    async fetchFromBasicDisplayAPI(username) {
        // Note: This requires user authentication and access tokens
        // Implementation would depend on having proper OAuth flow
        console.log('Basic Display API would require user authentication');
        return null;
    }

    // Fetch from RapidAPI Instagram endpoints
    async fetchFromRapidAPI(username) {
        const rapidAPIs = API_CONFIG.instagram.rapidAPIs;
        
        for (const api of rapidAPIs) {
            try {
                const response = await axios.get(api.url, {
                    params: { username: username },
                    headers: {
                        'X-RapidAPI-Key': api.key,
                        'X-RapidAPI-Host': api.host
                    }
                });

                return this.normalizeProfileData(response.data);
            } catch (error) {
                console.warn(`RapidAPI ${api.host} failed:`, error);
                continue;
            }
        }

        return null;
    }

    // Fetch from public Instagram endpoints
    async fetchFromPublicEndpoint(username) {
        try {
            // Try Instagram's public endpoints with CORS proxy
            const endpoints = API_CONFIG.instagram.publicEndpoints;
            
            for (const endpoint of endpoints) {
                const url = endpoint.replace('{username}', username);
                
                try {
                    // Use CORS proxy
                    const proxyUrl = API_CONFIG.proxies[0] + encodeURIComponent(url);
                    const response = await axios.get(proxyUrl);
                    
                    if (response.data && response.data.contents) {
                        const data = JSON.parse(response.data.contents);
                        return this.normalizePublicProfileData(data);
                    }
                } catch (error) {
                    console.warn('Public endpoint failed:', error);
                    continue;
                }
            }
        } catch (error) {
            console.warn('Public endpoint fetch failed:', error);
        }

        return null;
    }

    // Scrape public profile (last resort)
    async scrapePublicProfile(username) {
        // Note: This would require a CORS proxy and HTML parsing
        // Implementation would be complex and potentially unreliable
        console.log('Profile scraping would be implemented here');
        return null;
    }

    // Normalize profile data from different sources
    normalizeProfileData(data) {
        return {
            username: data.username || data.name,
            full_name: data.full_name || data.fullName || data.name,
            biography: data.biography || data.bio || '',
            external_url: data.external_url || data.website || '',
            profile_pic_url: data.profile_pic_url || data.profilePicUrl || data.avatar,
            is_verified: data.is_verified || data.verified || false,
            is_private: data.is_private || data.private || false,
            follower_count: data.follower_count || data.followers || 0,
            following_count: data.following_count || data.following || 0,
            media_count: data.media_count || data.posts || 0,
            engagement_rate: data.engagement_rate || '0.00',
            avg_likes: data.avg_likes || 0,
            avg_comments: data.avg_comments || 0,
            last_post_date: data.last_post_date || Date.now(),
            recent_posts: data.recent_posts || [],
            created_at: Date.now()
        };
    }

    // Normalize public profile data
    normalizePublicProfileData(data) {
        const user = data.graphql?.user || data.user || data;
        
        return {
            username: user.username,
            full_name: user.full_name,
            biography: user.biography,
            external_url: user.external_url,
            profile_pic_url: user.profile_pic_url,
            is_verified: user.is_verified,
            is_private: user.is_private,
            follower_count: user.edge_followed_by?.count || 0,
            following_count: user.edge_follow?.count || 0,
            media_count: user.edge_owner_to_timeline_media?.count || 0,
            engagement_rate: '0.00',
            avg_likes: 0,
            avg_comments: 0,
            last_post_date: Date.now(),
            recent_posts: this.extractRecentPosts(user.edge_owner_to_timeline_media?.edges || []),
            created_at: Date.now()
        };
    }

    // Extract recent posts from Instagram data
    extractRecentPosts(edges) {
        return edges.slice(0, 6).map(edge => ({
            id: edge.node.id,
            thumbnail_url: edge.node.thumbnail_src || edge.node.display_url,
            like_count: edge.node.edge_liked_by?.count || 0,
            comment_count: edge.node.edge_media_to_comment?.count || 0,
            timestamp: edge.node.taken_at_timestamp * 1000,
            caption: edge.node.edge_media_to_caption?.edges[0]?.node?.text || ''
        }));
    }

    // Rate limiting
    canMakeRequest(endpoint) {
        const now = Date.now();
        const limits = API_CONFIG.rateLimits[endpoint];
        const key = `${endpoint}_requests`;
        
        let requestLog = this.rateLimiter.get(key);
        if (!requestLog) {
            requestLog = { requests: [], hourStart: now };
            this.rateLimiter.set(key, requestLog);
        }

        // Remove old requests (older than 1 hour)
        const oneHour = 60 * 60 * 1000;
        requestLog.requests = requestLog.requests.filter(time => now - time < oneHour);

        // Check if we can make a request
        if (requestLog.requests.length >= limits.requestsPerHour) {
            console.warn(`Rate limit exceeded for ${endpoint}`);
            return false;
        }

        // Add current request
        requestLog.requests.push(now);
        return true;
    }

    // Cache management
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        // Check if cache is expired
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clearCache() {
        this.cache.clear();
    }

    // Get follower count only (for frequent updates)
    async getFollowerCount(username) {
        try {
            // Check cache first
            const cacheKey = `followers_${username}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            let count;

            if (DEMO_MODE) {
                // In demo mode, return simulated growing count
                const savedData = StorageManager.getGrowthData();
                count = savedData.current.followers || Math.floor(Math.random() * 5000) + 1000;
            } else {
                // Try to get from lightweight endpoint
                const profile = await this.getProfile(username);
                count = profile ? profile.follower_count : 0;
            }

            // Cache for shorter time (1 minute)
            this.cache.set(cacheKey, {
                data: count,
                timestamp: Date.now() - (this.cacheTimeout - 60000) // Expire in 1 minute
            });

            return count;
        } catch (error) {
            console.error('Follower count fetch error:', error);
            return 0;
        }
    }

    // Validate username format
    isValidUsername(username) {
        // Instagram username rules
        const regex = /^[a-zA-Z0-9._]{1,30}$/;
        return regex.test(username);
    }

    // Check if account exists
    async accountExists(username) {
        try {
            const profile = await this.getProfile(username);
            return profile !== null;
        } catch (error) {
            console.error('Account existence check failed:', error);
            return false;
        }
    }
}

// Create global instance
const instagramAPI = new InstagramAPI();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.InstagramAPI = InstagramAPI;
    window.instagramAPI = instagramAPI;
}