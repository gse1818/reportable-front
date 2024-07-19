import { useEffect, useState } from "react";
import Header from "../components/common/Header";
import useMe from "../apis/hook/useMe";
import { useNavigate } from "react-router-dom";
import dummyQuestions from "../data/dummyQuestions";
import Questionbox from "../components/common/Questionbox";
import { documentApi } from "../apis/document";
import JSZip from "jszip";
import WordDocumentViewer from "../components/html/WordDocumentViewer";
import ResetIcon from "../components/atom/ResetIcon";
import CreateIcon from "../components/atom/CreateIcon";

const EssayPage = () => {
  const { me, isLoadingMe } = useMe();
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState({
    topic: "",
    length: 1000,
    format: "",
    requirement: "",
  });
  const [hasAdditionalQuestions, setHasAdditionalQuestions] = useState(false);
  const [additionalQuestions, setAdditionalQuestions] =
    useState(dummyQuestions);
  const [isOutputCreated, setIsOutputCreated] = useState(false);
  const [pages, setPages] = useState([]);

  const handleEssayData = (e) => {
    const { id, value } = e.target;
    setEssayData({
      ...essayData,
      [id]: value,
    });
  };

  const resetEssayData = (e) => {
    const { id } = e.target;
    setEssayData({
      ...essayData,
      [id]: "",
    });
  };

  const handleEssaySubmit = async (e) => {
    e.preventDefault();
    try {
      const essaySubmitData = {
        title: essayData.topic,
        amount: essayData.length,
        type: "essay",
        prompt: essayData.requirement,
        form: essayData.format,
        elements: "",
        core: "",
      };
      const result = await documentApi(essaySubmitData);
      console.log("제출 완료");
      console.log(result.data.id);

      // S3 URL from the result
      const s3Url =
        "https://reportable-file-bucket.s3.ap-northeast-2.amazonaws.com/documents/1997%EB%85%84%EC%9D%98+%EB%8F%99%EC%95%84%EC%8B%9C%EC%95%84+%EC%99%B8%ED%99%98%EC%9C%84%EA%B8%B0%EC%99%80+2007~2008%EB%85%84%EC%97%90+%EB%B0%9C%EC%83%9D%ED%95%9C+%EA%B8%80%EB%A1%9C%EB%B2%8C+%EA%B8%88%EC%9C%B5%EC%9C%84%EA%B8%B0%EC%9D%98+%EC%9B%90%EC%9D%B8+%EB%B0%8F+%EB%8B%B9%EC%8B%9C+%EC%99%B8%ED%99%98%EC%8B%9C%EC%9E%A5%EA%B3%BC+%EA%B8%88%EC%9C%B5%EC%8B%9C%EC%9E%A5+%EB%93%B1%EC%9D%84+%EC%A1%B0%EC%82%AC%ED%95%98%EC%97%AC+%EA%B8%B0%EC%88%A0%ED%95%98%EC%8B%9C%EC%98%A4.-529c087b-bfe8-4572-8001-fc46c5e043bf.docx";

      // Fetch the Word file from S3 URL
      const response = await fetch(s3Url);
      const arrayBuffer = await response.arrayBuffer();
      console.log("파일 가져오기 완료");

      // Use JSZip to unzip the docx file
      const zip = await JSZip.loadAsync(arrayBuffer);
      const documentContent = await zip.file("word/document.xml").async("text");
      
      // Parse the document.xml and convert it to HTML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(documentContent, "application/xml");
      const paragraphs = xmlDoc.getElementsByTagName("w:p");
      const htmlArray = Array.from(paragraphs).map(p => {
        const texts = p.getElementsByTagName("w:t");
        return `<p>${Array.from(texts).map(t => t.textContent).join("")}</p>`;
      });
      const htmlString = htmlArray.join("");
      console.log("HTML 변환 완료");

      // Split HTML string into A4 pages
      const pageHeight = 1122; // Approximate height of an A4 page in pixels
      const div = document.createElement("div");
      div.innerHTML = htmlString;
      document.body.appendChild(div);

      const totalHeight = div.scrollHeight;
      const numberOfPages = Math.ceil(totalHeight / pageHeight);
      console.log("총 페이지 수:", numberOfPages);

      const pagesArray = [];
      for (let i = 0; i < numberOfPages; i++) {
        const page = div.cloneNode(true);
        page.style.height = `${pageHeight}px`;
        page.style.overflow = "hidden";
        page.style.position = "relative";
        page.style.top = `-${i * pageHeight}px`;
        document.body.appendChild(page);
        pagesArray.push(page.innerHTML);
        document.body.removeChild(page);
      }

      document.body.removeChild(div);
      setPages(pagesArray);
    } catch (error) {
      console.error("문서 생성 오류:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      alert(`${errorMessage} 문서 생성에 실패했습니다.`);
    }
    setHasAdditionalQuestions(true);
    setIsOutputCreated(!isOutputCreated);
    console.log(essayData);
  };

  useEffect(() => {
    if (!me && !isLoadingMe) {
      alert("로그인이 필요합니다.");
      navigate("/");
      navigate("/signin");
    }
  }, [me]);

  return (
    <>
      {hasAdditionalQuestions && (
        <div
          className="fixed top-0 bottom-0 left-0 right-0 bg-[rgba(217,217,217,0.20)] z-40 flex items-center justify-center"
          style={{ backdropFilter: "blur(5px)" }}
        >
          <div className="bg-[#ffffff] rounded-[10px] border-solid border-[#a0a0a0] border px-4 py-6 flex flex-col gap-[25px] items-center justify-center relative w-[500px]">
            <div className="px-1 text-left text-xl font-semibold relative">
              <span>
                <span className="div-span">추가질문</span>
                <span className="div-span2  text-orange-500">*</span>
              </span>{" "}
            </div>
            <div className="flex flex-col gap-5 items-start justify-start shrink-0 w-full relative">
              {additionalQuestions.map((question) => (
                <Questionbox question={question} />
              ))}
            </div>
            <button
              className="bg-[#299792] rounded-[10px] flex flex-row items-center justify-center w-full h-[60px] relative shrink-0"
              style={{
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
              }}
              onClick={() => {
                setHasAdditionalQuestions(false);
              }}
            >
              <div className="flex flex-row gap-1.5 items-center justify-center shrink-0 relative">
                <div className="text-white text-center relative">CREATE </div>
                <CreateIcon color="white" /> {/* CreateIcon 컴포넌트 사용 */}
              </div>
            </button>
          </div>
        </div>
      )}
      <Header className="fixed" />
      <form
        className="top-0 left-0 flex flex-col gap-2.5 items-center justify-between shrink-0 w-[313px] h-full fixed"
        style={{
          background: "linear-gradient(to left, #cae5e4, #cae5e4)",
        }}
        onSubmit={handleEssaySubmit}
      >
        <div className="flex flex-col items-center justify-start shrink-0 w-[289px] py-4 max-h-[80%] overflow-auto gap-[11px] absolute top-28 bottom-20">
          <div
            className="bg-[#ffffff] rounded-[10px] p-4 flex flex-col gap-0 items-center justify-center shrink-0 relative w-[98.5%] "
            style={{
              boxShadow: "0px 4px 64px 0px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="flex flex-col gap-2.5 items-start justify-start shrink-0 w-[98.5%] relative">
              <div className="flex flex-row items-center justify-between self-stretch shrink-0 relative w-full">
                <div className="px-1 text-left font-['Inter-SemiBold',_sans-serif] text-base font-semibold relative">
                  <span>
                    <span className="div-span">에세이 주제</span>
                    <span className="div-span2 text-orange-500">*</span>
                  </span>{" "}
                </div>
                <ResetIcon id="topic" onClick={resetEssayData} />
              </div>
              <textarea
                placeholder="작성할 에세이의 주제를 알려주세요."
                id="topic"
                value={essayData.topic}
                onChange={handleEssayData}
                readOnly={isOutputCreated}
                style={{
                  backgroundColor: isOutputCreated ? "#f5f5f5" : "#ffffff",
                }}
                className="overflow-auto rounded border-solid border-[#C2C2C2] border self-stretch shrink-0 h-[74px] relative text-[#9e9e9e] text-left font-['Inter-Regular',_sans-serif] text-xs leading-5 font-normal p-2"
              />
            </div>
          </div>
          <div
            className="bg-[#ffffff] rounded-[10px] p-4 flex flex-col gap-2.5 items-start justify-start shrink-0 relative w-[98.5%] "
            style={{
              boxShadow: "0px 4px 64px 0px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="flex flex-col gap-2.5 items-start justify-start shrink-0 w-full relative">
              <div className="flex flex-row items-center justify-between self-stretch shrink-0 relative w-full">
                <div className="px-1 text-left font-['Inter-SemiBold',_sans-serif] text-base font-semibold relative">
                  <span>
                    <span className="div-span3">분량</span>
                    <span className="div-span4 text-orange-500">*</span>
                  </span>{" "}
                </div>
                <ResetIcon id="length" onClick={resetEssayData} />
              </div>
              <div className="flex flex-row gap-2.5 items-center justify-start self-stretch shrink-0 relative">
                <input
                  id="length"
                  type="number"
                  min="0"
                  max="10000"
                  step="500"
                  placeholder="1500"
                  value={essayData.length}
                  onChange={handleEssayData}
                  readOnly={isOutputCreated}
                  autoComplete="off"
                  style={{
                    backgroundColor: isOutputCreated ? "#f5f5f5" : "#ffffff",
                  }}
                  className="rounded border-solid border-[#C2C2C2] border px-3 flex flex-row gap-1 items-end justify-start shrink-0 w-[80%] h-8 relative overflow-hidden text-gray02-70 text-left font-['Inter-Regular',_sans-serif] text-[11px] leading-5 font-normal"
                />
                <div className="text-[#000000] text-left font-['Inter-Regular',_sans-serif] text-[11px] leading-5 font-normal relative">
                  자 이상{" "}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#ffffff] rounded-[10px] p-4 flex flex-col gap-2.5 items-center justify-center shrink-0 relative w-[98.5%] ">
            <div className="flex flex-col gap-2.5 items-center justify-center shrink-0 w-full relative">
              <div className="flex flex-row items-center justify-between self-stretch shrink-0 relative w-full">
                <span className="px-1 text-[#000000] text-left font-['Inter-SemiBold',_sans-serif] text-base font-semibold relative">
                  양식{" "}
                </span>
                <ResetIcon id="format" onClick={resetEssayData} />
              </div>
              <textarea
                id="format"
                placeholder="서론, 본론, 결론, 참고문헌 등 따라야
                                        할 에세이의 양식이 있다면
                                        알려주세요."
                value={essayData.format}
                onChange={handleEssayData}
                readOnly={isOutputCreated}
                style={{
                  backgroundColor: isOutputCreated ? "#f5f5f5" : "#ffffff",
                }}
                className="overflow-auto rounded border-solid border-[#C2C2C2] border self-stretch shrink-0 h-[74px] relative text-[#9e9e9e] text-left font-['Inter-Regular',_sans-serif] text-xs leading-5 font-normal p-2"
              />
            </div>
          </div>
          <div className="bg-[#ffffff] rounded-[10px] p-4 flex flex-col gap-2.5 items-center justify-start shrink-0 relative w-[98.5%] ">
            <div className="flex flex-col gap-2 items-start justify-start shrink-0 w-full relative">
              <div className="flex flex-row items-center justify-between shrink-0 w-full relative">
                <div className="flex flex-row items-center justify-between shrink-0 relative">
                  <span className="px-1 text-[#000000] text-left font-['Inter-SemiBold',_sans-serif] text-base font-semibold relative">
                    프롬프트{" "}
                  </span>
                  <CreateIcon color="black" />
                </div>
                <ResetIcon id="prompt" onClick={resetEssayData} />
              </div>
              <span className="px-1 text-[#000000] text-left font-['Inter-Regular',_sans-serif] text-[9px] font-normal relative">
                레포트의 내용을 세밀하게 조정하고 싶다면, 아래 항목에 필요
                사항을
                <br />
                작성해주세요{" "}
              </span>
            </div>
            <textarea
              id="requirement"
              placeholder="ex) 서론 부분을 독자들의 흥미를 이끄는
                                내용으로 시작할 수 있게 해줘"
              value={essayData.requirement}
              readOnly={isOutputCreated}
              onChange={handleEssayData}
              style={{
                backgroundColor: isOutputCreated ? "#f5f5f5" : "#ffffff",
              }}
              className=" overflow-auto rounded border-solid border-[#C2C2C2] border self-stretch shrink-0 h-[74px] relative  text-[#9e9e9e] text-left font-['Inter-Regular',_sans-serif] text-xs leading-5 font-normal p-2"
            />
          </div>
        </div>
        <button
          className="bg-[#005f5f] rounded-[10px] bottom-1 flex flex-row gap-1 items-center justify-center mx-auto w-[289px] shrink-0 h-[60px] absolute"
          style={{
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
          type="submit"
        >
          <div className="flex flex-row gap-1.5 items-center justify-start shrink-0 relative">
            <div className="text-white text-center font-body-text-inter-14-medium-font-family text-body-text-inter-14-medium-font-size leading-body-text-inter-14-medium-line-height font-body-text-inter-14-medium-font-weight relative">
              CREATE{" "}
            </div>
            <CreateIcon color="white" />
          </div>
        </button>
      </form>
      <div className="bg-[#d9d9d9] pt-[104px] pl-[313px] h-screen overflow-y-auto">
        <WordDocumentViewer documentUrl={"https://reportable-file-bucket.s3.ap-northeast-2.amazonaws.com/documents/1997%EB%85%84%EC%9D%98+%EB%8F%99%EC%95%84%EC%8B%9C%EC%95%84+%EC%99%B8%ED%99%98%EC%9C%84%EA%B8%B0%EC%99%80+2007~2008%EB%85%84%EC%97%90+%EB%B0%9C%EC%83%9D%ED%95%9C+%EA%B8%80%EB%A1%9C%EB%B2%8C+%EA%B8%88%EC%9C%B5%EC%9C%84%EA%B8%B0%EC%9D%98+%EC%9B%90%EC%9D%B8+%EB%B0%8F+%EB%8B%B9%EC%8B%9C+%EC%99%B8%ED%99%98%EC%8B%9C%EC%9E%A5%EA%B3%BC+%EA%B8%88%EC%9C%B5%EC%8B%9C%EC%9E%A5+%EB%93%B1%EC%9D%84+%EC%A1%B0%EC%82%AC%ED%95%98%EC%97%AC+%EA%B8%B0%EC%88%A0%ED%95%98%EC%8B%9C%EC%98%A4.-529c087b-bfe8-4572-8001-fc46c5e043bf.docx" } />
      </div>
    </>
  );
};

export default EssayPage;
