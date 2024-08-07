import report from "../../assets/images/report.png";
import { useNavigate } from "react-router-dom";
import { deleteDocument } from "../../apis/document";

const ReportIcon = ({ documentType, documentTitle, documentId, color }) => {
    const navigate = useNavigate();
    const handleClick = (e) => {
        if (documentType === "essay") {
            navigate(`/essay/${documentId}`);
        } else {
            navigate(`/research/${documentId}`);
        }
    };

    const handleDeleteDocument = async (e) => {
        e.stopPropagation();
        const userConfirmed = window.confirm(
            "정말 해당 문서를 삭제하시겠습니까?"
        );
        if (userConfirmed) {
            await deleteDocument(documentId);
            alert("문서가 성공적으로 삭제되었습니다.");
            window.location.reload();
        }
    };

    return (
        <>
            <div
                className="cursor-pointer bg-[#FAFAFA] rounded-2xl border-solid border-greyscale-100 border-2 p-5 flex flex-col gap-4 items-start justify-start shrink-0 w-[204px] h-[253px] relative"
                onClick={handleClick}
            >
                <div
                    style={{ backgroundColor: color }}
                    className="rounded-2xl p-3 flex flex-row gap-3 items-center justify-center shrink-0 relative"
                >
                    <img
                        className="shrink-0 w-10 h-10 relative"
                        style={{ objectFit: "cover" }}
                        src={report}
                    />
                </div>
                <div className="w-3 h-3 absolute top-5 right-3">
                    <svg
                        className={"w-full h-full relative"}
                        width="170"
                        height="170"
                        viewBox="0 0 170 170"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={handleDeleteDocument}
                    >
                        <path
                            d="M165.49 148.51C167.744 150.764 169.011 153.822 169.011 157.01C169.011 160.198 167.744 163.256 165.49 165.51C163.236 167.764 160.178 169.031 156.99 169.031C153.802 169.031 150.744 167.764 148.49 165.51L85.0001 102L21.4901 165.49C19.2357 167.744 16.1782 169.011 12.9901 169.011C9.80194 169.011 6.7444 167.744 4.49006 165.49C2.23571 163.236 0.969238 160.178 0.969238 156.99C0.969238 153.802 2.23571 150.744 4.49006 148.49L68.0001 85L4.51005 21.49C2.25571 19.2357 0.989239 16.1782 0.989239 12.99C0.989239 9.80193 2.25571 6.74438 4.51005 4.49004C6.76439 2.2357 9.82193 0.969227 13.0101 0.969227C16.1982 0.969227 19.2557 2.2357 21.5101 4.49004L85.0001 68L148.51 4.48004C150.764 2.2257 153.822 0.959228 157.01 0.959229C160.198 0.959229 163.256 2.2257 165.51 4.48004C167.764 6.73438 169.031 9.79192 169.031 12.98C169.031 16.1682 167.764 19.2257 165.51 21.48L102 85L165.49 148.51Z"
                            fill="black"
                        />
                    </svg>
                </div>
                <div className="flex flex-col gap-1 items-start justify-start self-stretch shrink-0 relative">
                    <div className="text-[#212121] text-left font-bold text-lg font-urbanist leading-[1.6] relative self-stretch flex items-center justify-start">
                        {documentType}
                    </div>
                    <div
                        className="multiline-truncate text-greyscale-700 text-left font-body-medium-regular-font-family text-body-medium-regular-font-size leading-body-medium-regular-line-height font-body-medium-regular-font-weight relative self-stretch flex items-center justify-start"
                        style={{
                            letterSpacing:
                                "var(--body-medium-regular-letter-spacing, 0.2px)",
                        }}
                    >
                        {documentTitle}{" "}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportIcon;
