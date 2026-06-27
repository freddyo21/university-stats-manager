import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localizationPath = path.join(__dirname, "localization.json");
const OUTPUT_DIR = path.join(__dirname, "locales");

/**
 * Hàm helper để gán giá trị vào một object lồng nhau dựa trên chuỗi key có dấu chấm (e.g. "common.collapse.all")
 */
function setNestedProperty(obj, compoundKey, value) {
    const keys = compoundKey.split(".");
    let current = obj;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        // Nếu là key cuối cùng, gán giá trị thô vào luôn
        if (i === keys.length - 1) {
            current[key] = value;
        } else {
            // Nếu chưa phải key cuối và nút con chưa tồn tại, khởi tạo nó làm một object rỗng
            if (!current[key]) {
                current[key] = {};
            } else if (typeof current[key] !== "object") {
                // Xử lý kịch bản xung đột đặc biệt: Nếu key cha vừa là string thô (ví dụ "common.collapse": "Thu gọn")
                // vừa có key con ("common.collapse.all"), chúng ta chuyển chữ thô đó vào thuộc tính "DEFAULT"
                const oldValue = current[key];
                current[key] = {
                    "DEFAULT": oldValue
                };
            }
            current = current[key];
        }
    }
}

function splitLocalizations() {
    try {
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        const rawData = fs.readFileSync(localizationPath, "utf8");
        const masterJson = JSON.parse(rawData);

        const allLanguages = new Set();
        Object.values(masterJson).forEach((translations) => {
            Object.keys(translations).forEach((lang) => allLanguages.add(lang));
        });

        // Khởi tạo object chứa dữ liệu gốc cho từng ngôn ngữ
        const languagesData = {};
        allLanguages.forEach((lang) => {
            languagesData[lang] = {};
        });

        // Sắp xếp các key theo độ dài (số lượng dấu chấm) tăng dần để xử lý các node cha trước, node con sau
        const sortedStringKeys = Object.keys(masterJson).sort((a, b) => {
            return a.split(".").length - b.split(".").length;
        });

        // Duyệt qua từng key lớn đã được sắp xếp để bóc tách dữ liệu
        sortedStringKeys.forEach((stringKey) => {
            const translations = masterJson[stringKey];

            allLanguages.forEach((lang) => {
                // Nếu ngôn ngữ này có bản dịch thì lấy bản dịch, nếu thiếu thì dùng luôn stringKey
                const value = (translations[lang] && translations[lang].trim() !== "")
                    ? translations[lang]
                    : stringKey;

                // Sử dụng hàm helper để build cấu trúc lồng lớp thay vì gán phẳng như cũ
                setNestedProperty(languagesData[lang], stringKey, value);
            });
        });

        // Xuất ra các file .json lẻ cấu trúc lồng lớp hoàn hảo
        Object.keys(languagesData).forEach((lang) => {
            const langFilePath = path.join(OUTPUT_DIR, `${lang}.json`);
            const dataToWrite = languagesData[lang];

            fs.writeFileSync(langFilePath, JSON.stringify(dataToWrite, null, 2), "utf8");
            console.log(`Đã bóc tách và lồng khối thành công gói ngôn ngữ: -> ${lang}.json`);
        });

        console.log(`\n Hoàn tất! Tất cả các file JSON lồng lớp đã được xuất tại thư mục: ${OUTPUT_DIR}`);

    } catch (error) {
        console.error("Gặp lỗi trong quá trình bóc tách file JSON:", error);
    }
}

splitLocalizations();