// File: voh.js v5 - Final reliable version
(function() {
    console.log('voh.js v5 loaded!');
    try {
        function findBestTemplate(width, height) {
            const targetRatio = height / width;
            const templates = [
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
        
        // NÂNG CẤP: Hàm mới để đọc kích thước dự kiến của ad slot
        function getIntendedAdSize(adSlot) {
            // Ưu tiên 1: Kích thước thực tế nếu nó đủ lớn
            if (adSlot.offsetHeight >= 40) {
                return { width: adSlot.offsetWidth, height: adSlot.offsetHeight };
            }

            // Ưu tiên 2: Kích thước từ iframe aswift mà AdSense đã tạo
            const aswiftIframe = adSlot.querySelector('iframe[id^="aswift_"]');
            if (aswiftIframe) {
                const width = parseInt(aswiftIframe.getAttribute('width'), 10);
                const height = parseInt(aswiftIframe.getAttribute('height'), 10);
                if (width > 0 && height > 0) {
                    return { width, height };
                }
            }

            // Phương án cuối: Dựa vào chiều rộng của thẻ cha
            const parentWidth = adSlot.parentElement.offsetWidth || 300;
            const defaultHeight = parentWidth > 500 ? 90 : 250;
            return { width: parentWidth, height: defaultHeight };
        }

        function insertFallbackContent(adSlot) {
            if (adSlot.dataset.fallbackInserted) return;
            adSlot.dataset.fallbackInserted = 'true';

            const intendedSize = getIntendedAdSize(adSlot);
            const template = findBestTemplate(intendedSize.width, intendedSize.height);

            if (adSlot.offsetHeight >= 40) {
                // TRƯỜNG HỢP 1: QC giữ nguyên chiều cao -> Chèn vào trong
                const iframe = document.createElement('iframe');
                iframe.src = template.url;
                iframe.title = "Gợi ý sản phẩm";
                iframe.loading = "lazy";
                iframe.style.width = `${adSlot.offsetWidth}px`;
                iframe.style.height = `${adSlot.offsetHeight}px`;
                iframe.style.border = "none";
                adSlot.innerHTML = '';
                adSlot.appendChild(iframe);
            } else {
                // TRƯỜNG HỢP 2: QC bị thu gọn -> Chèn 1 div mới ở bên dưới
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
