(function() {
    // Bao bọc toàn bộ mã trong một IIFE để tránh xung đột
    console.log('voh.js loaded!');
    try {
        function findBestTemplate(width, height) {
            const targetRatio = height / width;
            const templates = [
                // QUAN TRỌNG: Sử dụng URL đầy đủ đến các template
                { width: 300, height: 600, url: 'https://msdigita.github.io/fallback/voh_300x600.html' },
                { width: 300, height: 250, url: 'https://msdigita.github.io/fallback/voh_300x250.html' },
                { width: 728, height: 90,  url: 'https://msdigita.github.io/fallback/voh_728x90.html' },
                { width: 390, height: 390, url: 'https://msdigita.github.io/fallback/voh_390x390.html' }
            ];
            const defaultTemplate = 'https://msdigita.github.io/fallback/voh_responsive.html';

            let bestMatch = null;
            let smallestDiff = Infinity;

            for (const template of templates) {
                const templateRatio = template.height / template.width;
                const diff = Math.abs(targetRatio - templateRatio);
                if (diff < smallestDiff) {
                    smallestDiff = diff;
                    bestMatch = template;
                }
            }
            
            if (smallestDiff > 0.5) {
                return defaultTemplate;
            }
            return bestMatch ? bestMatch.url : defaultTemplate;
        }
        
        function handleUnfilledAd(adSlot) {
            setTimeout(() => {
                if (adSlot.getAttribute('data-ad-status') === 'unfilled') {
                    if (adSlot.querySelector('.fallback-content-inserted')) return;

                    const adWidth = adSlot.offsetWidth;
                    const adHeight = adSlot.offsetHeight;
                    const MIN_FALLBACK_HEIGHT = 150;

                    if (adWidth < 100 || adHeight < MIN_FALLBACK_HEIGHT) {
                        adSlot.style.display = 'none';
                        return;
                    }

                    const templateUrl = findBestTemplate(adWidth, adHeight);
                    const iframe = document.createElement('iframe');
                    iframe.src = templateUrl;
                    iframe.title = "Gợi ý sản phẩm";
                    iframe.loading = "lazy";
                    iframe.style.width = `${adWidth}px`;
                    iframe.style.height = `${adHeight}px`;
                    iframe.style.border = "none";
                    iframe.classList.add('fallback-content-inserted');

                    adSlot.innerHTML = '';
                    adSlot.appendChild(iframe);
                }
            }, 500);
        }

        const adObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adSlot = entry.target;
                    handleUnfilledAd(adSlot);
                    observer.unobserve(adSlot);
                }
            });
        }, { threshold: 0.1 });

        // Chạy sau khi trang đã tải xong để đảm bảo các ad slot đã tồn tại
        window.addEventListener('load', () => {
             document.querySelectorAll('ins.adsbygoogle').forEach(ad => {
                adObserver.observe(ad);
            });
        });

    } catch (e) {
        console.error('Ad Fallback Script Error:', e);
    }
})();
