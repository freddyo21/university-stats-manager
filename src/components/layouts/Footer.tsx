import { useI18n } from "@/i18n/use-i18n";
import { NavLink } from "react-router-dom";

export function Footer() {
    const { t } = useI18n();

    return (
        <>
            <footer className="border-t border-border bg-background py-10 text-sm text-muted-foreground">
                <div className="container mx-auto grid grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Cột 1: Thông tin liên hệ */}
                    <address className="flex flex-col gap-2 not-italic">
                        <h3 className="font-semibold text-foreground">{t("footer.contact.DEFAULT")}</h3>
                        <p>{t("footer.contact.email")}:&nbsp;
                            <a href="mailto:freddy.preo21@gmail.com"
                                className="hover:underline text-blue-400 font-semibold">
                                freddy.preo21@gmail.com
                            </a>
                        </p>
                        <p>{t("footer.contact.phone")}:&nbsp;
                            <a href="tel:+84984528986"
                                className="hover:underline text-blue-400 font-semibold">
                                +84 984 528 986
                            </a>
                        </p>
                        <p>LinkedIn:&nbsp;
                            <a href="https://www.linkedin.com/in/freddy0605/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-blue-400 font-semibold">
                                Freddy
                            </a>
                        </p>
                        <p>GitHub:&nbsp;
                            <a href="https://github.com/freddyo21"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-blue-400 font-semibold">
                                freddyo21
                            </a>
                        </p>
                    </address>

                    {/* Cột 2: Điều hướng nhanh (Cột Giữa) */}
                    {/* Nhiệm vụ: Giúp người dùng ngoài Landing Page biết app có những tính năng gì để bấm vào dùng thử luôn */}
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold text-foreground">{t("footer.links")}</h3>
                        <NavLink to="/" className="text-xs hover:underline transition-colors">{t("nav.entry")}</NavLink>
                        <NavLink to="/roadmap" className="text-xs hover:underline transition-colors">{t("nav.roadmap")}</NavLink>
                        <NavLink to="/goals" className="text-xs hover:underline transition-colors">{t("nav.goals")}</NavLink>
                        <NavLink to="/privacy" className="text-xs hover:underline transition-colors">{t("nav.privacy")}</NavLink>
                    </div>

                    {/* Cột 3: Bản quyền / Tổ chức (Cột Phải) */}
                    {/* Nhiệm vụ: Đẩy sang lề phải ở màn hình máy tính để tạo điểm chốt chặn thị giác, nhấn mạnh tính an toàn dữ liệu */}
                    <div className="flex flex-col gap-2 sm:text-right">
                        <h3 className="font-semibold text-foreground">{t("data.privacyHeader")}</h3>
                        <p className="text-xs max-w-xs sm:ml-auto">
                            {t("app.tagline")}
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
                            <p>© {new Date().getFullYear()} Study Stats Suite.</p>
                            <p className="text-[10px] opacity-75">{t("common.slogan")}</p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}