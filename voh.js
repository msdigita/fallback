// File: voh.js v3 - Cập nhật để xử lý banner nhỏ
(function() {
    console.log('voh.js v3 loaded!');
    try {
        function findBestTemplate(width, height) {
            const targetRatio = height / width;
            const templates = [
                // BƯỚC 1: Bổ sung template 320x50 vào danh sách
                { width: 320, height: 50,  url: 'https://msdigita.github.io/fallback/voh_320x50.html' },
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
            
            if (smallestDiff > 0.5) { 
                 return { ...defaultTemplate, width: width, height: height };
            }
            return bestMatch ? bestMatch : { ...defaultTemplate, width: width, height: height };
        }
        
        function insertFallbackContent(adSlot) {
            if (adSlot.dataset.fallbackInserted) return;
            adSlot.dataset.fallbackInserted = 'true';

            const adHeight = adSlot.offsetHeight;
            // BƯỚC 2: Giảm chiều cao tối thiểu để xử lý các banner nhỏ
            const MIN_FALLBACK_HEIGHT = 40; 

            if (adHeight >= MIN_FALLBACK_HEIGHT) {
                // TRƯỜNG HỢP 1: QC giữ nguyên chiều cao -> Chèn vào trong
                const adWidth = adSlot.offsetWidth;
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
                const parentWidth = adSlot.parentElement.offsetWidth;
                const template = findBestTemplate(parentWidth, 250); // Mặc định tìm template MREC
                
                const fallbackContainer = document.createElement('div');
                fallbackContainer.style.width = `${template.width}px`;
                fallbackContainer.style.height = `${template.height}px`;
                fallbackContainer.style.margin = '10px auto';
                fallbackContainer.style.maxWidth = '100%';

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
                adSlot.style.display = 'none';
            }
        }

        function observeAdSlot(adSlot) {
            if (adSlot.getAttribute('data-ad-status')) {
                if (adSlot.getAttribute('data-ad-status') === 'unfilled') {
                    insertFallbackContent(adSlot);
                }
                return;
            }

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

        window.addEventListener('load', () => {
             document.querySelectorAll('ins.adsbygoogle').forEach(observeAdSlot);
        });

    } catch (e) {
        console.error('Ad Fallback Script Error:', e);
    }
})();
