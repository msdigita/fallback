// File: qc.js - Host trên https://msdigital.vn/qc.js
(function() {
    try {
        function findBestTemplate(width, height) {
            const targetRatio = height / width;
            const templates = [
                { width: 300, height: 600, url: 'https://msdigita.github.io/fallback/voh_300x600.html' },
                { width: 300, height: 250, url: 'https://msdigita.github.io/fallback/voh_300x250.html' },
                { width: 728, height: 90,  url: 'https://msdigita.github.io/fallback/voh_728x90.html' },
                { width: 390, height: 390, url: 'https://msdigita.github.io/fallback/voh_390x390.html' }
            ];
            const defaultTemplate = { url: 'https://msdigita.github.io/fallback/voh_responsive.html' };
            
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
            if (smallestDiff > 0.5 && width < height) { // Chỉ dùng default cho các size không xác định
                 return { ...defaultTemplate, width: width, height: height };
            }
            return bestMatch ? bestMatch : { ...defaultTemplate, width: width, height: height };
        }
        
        function insertFallbackContent(adSlot) {
            if (adSlot.dataset.fallbackInserted) return;
            adSlot.dataset.fallbackInserted = 'true';

            const adWidth = adSlot.offsetWidth;
            const adHeight = adSlot.offsetHeight;
            const MIN_FALLBACK_HEIGHT = 150;

            if (adHeight >= MIN_FALLBACK_HEIGHT) {
                // TRƯỜNG HỢP 1: QC giữ nguyên chiều cao -> Chèn vào trong
                const template = findBestTemplate(adWidth, adHeight);
                const iframe = document.createElement('iframe');
                iframe.src = template.url;
                iframe.title = "Gợi ý sản phẩm";
                iframe.loading = "lazy";
                iframe.style.width = `${adWidth}px`;
                iframe.style.height = `${adHeight}px`;
                iframe.style.border = "none";
                adSlot.innerHTML = '';
                adSlot.appendChild(iframe);
            } else {
                // TRƯỜNG HỢP 2: QC bị thu gọn -> Chèn 1 div mới ở bên dưới
                // Cần 1 kích thước tham chiếu. Lấy từ data-ad-format="auto" không đáng tin cậy.
                // Chúng ta sẽ giả định một kích thước mặc định hợp lý nếu không thể xác định.
                const intendedWidth = adSlot.parentElement.offsetWidth || 300;
                const intendedHeight = 600; // Mặc định là MREC

                const template = findBestTemplate(intendedWidth, intendedHeight);
                
                const fallbackContainer = document.createElement('div');
                fallbackContainer.style.width = `${template.width}px`;
                fallbackContainer.style.height = `${template.height}px`;
                fallbackContainer.style.margin = '10px auto';

                const iframe = document.createElement('iframe');
                iframe.src = template.url;
                iframe.title = "Gợi ý sản phẩm";
                iframe.loading = "lazy";
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = "1px solid #e0e0e0";
                iframe.style.borderRadius = "4px";

                fallbackContainer.appendChild(iframe);
                adSlot.insertAdjacentElement('afterend', fallbackContainer);
                // adSlot.style.display = 'none'; // Ẩn ad slot gốc đã bị thu gọn
            }
        }

        function observeAdStatus(adSlot) {
            const observer = new MutationObserver((mutationsList, mutationObserver) => {
                for(const mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-ad-status') {
                        if (adSlot.getAttribute('data-ad-status') === 'unfilled') {
                            insertFallbackContent(adSlot);
                        }
                        mutationObserver.disconnect();
                        return;
                    }
                }
            });
            observer.observe(adSlot, { attributes: true });
        }

        const intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adSlot = entry.target;
                    observeAdStatus(adSlot);
                    observer.unobserve(adSlot);
                }
            });
        }, { threshold: 0.1 });

        window.addEventListener('load', () => {
             document.querySelectorAll('ins.adsbygoogle').forEach(ad => {
                if (ad.getAttribute('data-ad-status')) {
                    if (ad.getAttribute('data-ad-status') === 'unfilled') {
                        insertFallbackContent(ad);
                    }
                } else {
                    intersectionObserver.observe(ad);
                }
            });
        });

    } catch (e) {
        console.error('Ad Fallback Script Error:', e);
    }
})();
