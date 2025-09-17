// File: voh.js v2 - Đã được nâng cấp
(function() {
    console.log('voh.js v2 loaded!');
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

            // Nếu không có template nào có tỷ lệ gần đúng, dùng template responsive mặc định
            if (smallestDiff > 0.5) {
                return { ...defaultTemplate, width: width, height: height };
            }
            return bestMatch ? bestMatch : { ...defaultTemplate, width: width, height: height };
        }
        
        function insertFallbackContent(adSlot) {
            if (adSlot.dataset.fallbackInserted) return;
            adSlot.dataset.fallbackInserted = 'true';

            const adHeight = adSlot.offsetHeight;
            const MIN_FALLBACK_HEIGHT = 150;

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
                // NÂNG CẤP: Lấy chiều rộng của thẻ cha để chọn template thông minh hơn
                const parentWidth = adSlot.parentElement.offsetWidth;
                
                // Chọn một chiều cao mặc định an toàn, ví dụ 250px, để tìm template phù hợp nhất
                const template = findBestTemplate(parentWidth, 250); 
                
                const fallbackContainer = document.createElement('div');
                // Lấy kích thước từ template đã được chọn
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
                adSlot.style.display = 'none'; // Ẩn ad slot gốc đã bị thu gọn
            }
        }

        // NÂNG CẤP: Chỉ sử dụng MutationObserver
        function observeAdSlot(adSlot) {
            // Nếu ad slot đã có trạng thái rồi -> xử lý ngay
            if (adSlot.getAttribute('data-ad-status')) {
                if (adSlot.getAttribute('data-ad-status') === 'unfilled') {
                    insertFallbackContent(adSlot);
                }
                return;
            }

            // Nếu chưa có -> "lắng nghe" sự thay đổi
            const observer = new MutationObserver((mutationsList, mutationObserver) => {
                for(const mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-ad-status') {
                        if (adSlot.getAttribute('data-ad-status') === 'unfilled') {
                            insertFallbackContent(adSlot);
                        }
                        // Sau khi xử lý xong, ngắt kết nối để tiết kiệm tài nguyên
                        mutationObserver.disconnect();
                        return;
                    }
                }
            });
            observer.observe(adSlot, { attributes: true });
        }

        // Chạy sau khi DOM đã sẵn sàng
        // NÂNG CẤP: Có thể dùng DOMContentLoaded để chạy sớm hơn
        window.addEventListener('load', () => {
             document.querySelectorAll('ins.adsbygoogle').forEach(observeAdSlot);
        });

    } catch (e) {
        console.error('Ad Fallback Script Error:', e);
    }
})();
