export class FormInputInvalidException extends Error {
    constructor(message?: string) {
        super(message || "Dữ liệu nhập vào không hợp lệ.");
        this.name = "FormInputInvalidException";
        Object.setPrototypeOf(this, FormInputInvalidException.prototype);
    }
}
