import { useI18n } from "@/hooks/use-i18n";
import type { Dict } from "@/types/interfaces/i18n";

const i18n: Dict = {
    "automaticFetch": { en: "Automatic Fetch", vi: "Đồng bộ điểm số tự động" },
    "extensionDesc": {
        en: "Install the browser extension to automatically fetch grades from the university portal in 3 seconds.",
        vi: "Tải và cài đặt tiện ích mở rộng để tự động lấy điểm từ cổng đào tạo trường trong 3 giây."
    },
    "downloadExtension": { en: "Download Extension (It's Free!)", vi: "Tải về Extension (Miễn phí!)" },
    "downloadHelperHeader": { en: "How to Install the Extension", vi: "Hướng dẫn cài đặt nhanh" },
    "downloadHelperDesc": {
        en: "After downloading the extension, follow these steps to install it in your browser.",
        vi: "Sau khi tải về extension, làm theo các bước sau để cài đặt vào trình duyệt của bạn."
    },
    "downloadHelperStep1": {
        en: "Download the <code style=\"color: oklch(70.7% 0.165 254.624)\">.crx</code> file above.",
        vi: "Tải file <code style=\"color: oklch(70.7% 0.165 254.624)\">.crx</code> ở trên về máy."
    },
    "downloadHelperStep2": {
        en: "Open a new tab and go to <code style=\"color: oklch(70.7% 0.165 254.624)\">chrome://extensions/</code>",
        vi: "Mở tab mới và truy cập: <code style=\"color: oklch(70.7% 0.165 254.624)\">chrome://extensions/</code>"
    },
    "downloadHelperStep3": {
        en: "Enable <b>\"Developer Mode\"</b> in the top right corner.",
        vi: "Bật <b>\"Chế độ dành cho nhà phát triển\"</b> ở góc trên bên phải."
    },
    "downloadHelperStep4": {
        en: "Drag and drop the downloaded file into the browser to install.",
        vi: "Kéo thả file vừa tải vào giữa trình duyệt để cài đặt."
    },
    "downloadHelperStep5": {
        en: "Refresh the page and click on the extension icon, then find \"Grade Crawler Assistant\".",
        vi: "Refresh lại trang rồi bấm vào biểu tượng extension, tìm đến <b style=\"color: oklch(70.7% 0.165 254.624)\">Grade Crawler Assistant</b>."
    }
}

export default function ExtensionDownloadSection() {
    const { lang } = useI18n();

    return (
        <div className="flex flex-col items-center p-6 bg-slate-900 text-white rounded-xl border border-slate-800">
            <h3 className="text-lg font-bold mb-2">✨ {i18n.automaticFetch[lang]}</h3>
            <p className="text-sm text-slate-400 mb-4 text-center">
                {i18n.extensionDesc[lang]}
            </p>

            {/* Thẻ download file crx trực tiếp từ thư mục public */}
            <a
                href="/extensions/grade-scraper.crx"
                download="grade-scraper.crx"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm transition-colors duration-200"
            >
                📥 {i18n.downloadExtension[lang]}
            </a>

            <div className="mt-4 text-xs text-slate-500 text-left w-full border-t border-slate-800 pt-3">
                <p className="font-semibold mb-1">🛠️ {i18n.downloadHelperHeader[lang]}:</p>
                <p className="text-sm mb-2">{i18n.downloadHelperDesc[lang]}</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li dangerouslySetInnerHTML={{ __html: i18n.downloadHelperStep1[lang] }} />
                    <li dangerouslySetInnerHTML={{ __html: i18n.downloadHelperStep2[lang] }} />
                    <li dangerouslySetInnerHTML={{ __html: i18n.downloadHelperStep3[lang] }} />
                    <li dangerouslySetInnerHTML={{ __html: i18n.downloadHelperStep4[lang] }} />
                    <li dangerouslySetInnerHTML={{ __html: i18n.downloadHelperStep5[lang] }} />
                </ol>
            </div>
        </div> 
    );
}