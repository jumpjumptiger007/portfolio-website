const REDDIT_API = 'https://www.reddit.com/r/InterdimensionalCable/hot.json?limit=100';
let videoList = [];

// 解析 YouTube 视频 ID
function parseYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// 切台逻辑：直接修改 iframe src
function changeChannel() {
    if (videoList.length === 0) return;
    
    // 随机选择一个视频 ID
    const randomId = videoList[Math.floor(Math.random() * videoList.length)];
    const iframe = document.getElementById('player');
    
    // 使用标准的 YouTube Embed URL 形式，彻底杜绝 Error 153
    iframe.src = `https://www.youtube.com/embed/${randomId}?autoplay=1&enablejsapi=1`;
}

// 抓取 Reddit 数据
async function loadRedditVideos() {
    try {
        const res = await fetch(REDDIT_API);
        const data = await res.json();
        const posts = data.data.children;

        videoList = [];
        posts.forEach(post => {
            const ytId = parseYoutubeId(post.data.url);
            if (ytId) {
                videoList.push(ytId);
            }
        });

        if (videoList.length > 0) {
            changeChannel();
        }
    } catch (err) {
        console.error("Fetch Reddit Error:", err);
    }
}

// 绑定按钮点击事件
document.getElementById('next-btn').addEventListener('click', changeChannel);

// 页面加载完成后自动运行
document.addEventListener('DOMContentLoaded', loadRedditVideos);
