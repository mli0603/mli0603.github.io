/**
 * Blog functionality for magazine-style layout
 * Handles markdown parsing, frontmatter extraction, and dynamic content loading
 */

// Blog configuration is now defined in HTML as window.BLOG_CONFIG

/**
 * Simple frontmatter parser for extracting metadata from markdown files
 * @param {string} content - Raw markdown content with frontmatter
 * @returns {Object} - Parsed metadata and content
 */
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        return { metadata: {}, content: content };
    }
    
    const frontmatter = match[1];
    const body = match[2];
    const metadata = {};
    
    // Parse YAML-like frontmatter
    frontmatter.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            // Remove quotes if present
            value = value.replace(/^["']|["']$/g, '');
            metadata[key] = value;
        }
    });
    
    return { metadata, content: body };
}

/**
 * Format date for display
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    if (!dateString || dateString === 'No date') {
        return 'No date';
    }
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Create excerpt from content if not provided in frontmatter
 * @param {string} content - Markdown content
 * @param {number} maxLength - Maximum length of excerpt
 * @returns {string} - Generated excerpt
 */
function generateExcerpt(content, maxLength = 200) {
    // Remove markdown syntax and get plain text
    const plainText = content
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`(.*?)`/g, '$1') // Remove inline code
        .trim();
    
    if (plainText.length <= maxLength) {
        return plainText;
    }
    
    return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Load and display blog posts in magazine format
 * @param {Array} blogFiles - Array of markdown filenames to load
 */
function loadBlogPosts(blogFiles) {
    showLoadingState();
    
    const promises = blogFiles.map(filename => {
        return fetch(filename)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(content => {
                const parsed = parseFrontmatter(content);
                return {
                    filename: filename,
                    title: parsed.metadata.title || filename.replace('.md', '').replace(/-/g, ' '),
                    excerpt: parsed.metadata.excerpt || generateExcerpt(parsed.content),
                    date: parsed.metadata.date || 'No date',
                    content: parsed.content,
                    metadata: parsed.metadata
                };
            })
            .catch(error => {
                console.error(`Failed to load ${filename}:`, error);
                return null; // Return null for failed loads
            });
    });

    Promise.all(promises).then(posts => {
        hideLoadingState();
        const validPosts = posts.filter(post => post !== null);
        
        if (validPosts.length > 0) {
            // Sort by date (newest first)
            validPosts.sort((a, b) => {
                if (a.date === 'No date' && b.date === 'No date') return 0;
                if (a.date === 'No date') return 1;
                if (b.date === 'No date') return -1;
                return new Date(b.date) - new Date(a.date);
            });
            displayBlogPosts(validPosts);
        } else {
            showEmptyState();
        }
    }).catch((error) => {
        console.error('Error loading blog posts:', error);
        hideLoadingState();
        showErrorState();
    });
}

/**
 * Display blog posts in magazine-style grid
 * @param {Array} posts - Array of post objects
 */
function displayBlogPosts(posts) {
    const postsContainer = $('#blog-posts');
    postsContainer.empty();
    
    posts.forEach(function(post) {
        const postCard = $(`
            <article class="post-card">
                <a href="blog-post.html?post=${encodeURIComponent(post.filename)}">
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span class="post-date">${formatDate(post.date)}</span>
                    </div>
                </a>
            </article>
        `);
        
        postsContainer.append(postCard);
    });
}

/**
 * Load and display individual blog post
 * @param {string} filename - Markdown filename
 */
function loadBlogPost(filename) {
    showLoadingState();
    
    // Load the markdown file directly and parse frontmatter
    fetch(filename)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(markdown => {
            const parsed = parseFrontmatter(markdown);
            const post = {
                title: parsed.metadata.title || filename.replace('.md', '').replace(/-/g, ' '),
                date: parsed.metadata.date || 'No date',
                excerpt: parsed.metadata.excerpt || '',
                filename: filename,
                metadata: parsed.metadata
            };
            displayBlogPost(post, parsed.content);
        })
        .catch(error => {
            console.error(`Failed to load blog post ${filename}:`, error);
            hideLoadingState();
            showErrorState();
        });
}

/**
 * Display individual blog post content
 * @param {Object} post - Post metadata
 * @param {string} markdownContent - Markdown content without frontmatter
 */
function displayBlogPost(post, markdownContent) {
    // Update page title and header
    $('#page-title').text(`${post.title} - Max Li 李赵硕`);
    $('#blog-title').text(post.title);
    $('#blog-meta').html(`${formatDate(post.date)}`);
    
    // Parse and display markdown (without frontmatter)
    const html = marked.parse(markdownContent);
    $('#blog-body').html(html);
    
    // Hide loading, show content
    hideLoadingState();
    $('#blog-content').show();
}

/**
 * Show loading state
 */
function showLoadingState() {
    $('#loading').show();
    $('#blog-posts, #blog-content, #error, #empty-state').hide();
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    $('#loading').hide();
    $('#blog-posts').show();
}

/**
 * Show error state
 */
function showErrorState() {
    $('#error').show();
    $('#loading, #blog-posts, #blog-content, #empty-state').hide();
}

/**
 * Show empty state when no posts are available
 */
function showEmptyState() {
    $('#empty-state').show();
    $('#loading, #blog-posts, #blog-content, #error').hide();
}

/**
 * Initialize blog listing page
 * @param {Array} blogFiles - Array of markdown filenames to load
 */
function initializeBlogListing(blogFiles) {
    loadBlogPosts(blogFiles);
}

/**
 * Initialize blog post page
 */
function initializeBlogPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postFilename = urlParams.get('post');
    
    if (postFilename) {
        loadBlogPost(postFilename);
    } else {
        showErrorState();
    }
}

/**
 * Display static blog posts (for GitHub Pages compatibility)
 * @param {Array} posts - Array of static post objects
 */
function displayStaticBlogPosts(posts) {
    const postsContainer = $('#blog-posts');
    postsContainer.empty();
    
    // Sort by date (newest first)
    posts.sort((a, b) => {
        if (a.date === 'No date' && b.date === 'No date') return 0;
        if (a.date === 'No date') return 1;
        if (b.date === 'No date') return -1;
        return new Date(b.date) - new Date(a.date);
    });
    
    posts.forEach(function(post) {
        const postCard = $(`
            <article class="post-card">
                <a href="${post.filename}">
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span class="post-date">${formatDate(post.date)}</span>
                    </div>
                </a>
            </article>
        `);
        
        postsContainer.append(postCard);
    });
    
    // Show the posts container
    $('#loading').hide();
    $('#blog-posts').show();
}

// Export functions for global use
window.BlogManager = {
    initializeBlogListing,
    initializeBlogPost,
    loadBlogPosts,
    loadBlogPost,
    parseFrontmatter,
    formatDate,
    generateExcerpt
};

// Export static function globally
window.displayStaticBlogPosts = displayStaticBlogPosts;
