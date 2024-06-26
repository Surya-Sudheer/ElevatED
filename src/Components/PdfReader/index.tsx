import { useEffect, useState } from "react";
import { GenerateQA } from "./generateQA";
import { useModuleStore } from "../../Sections/Faculties/Pages/Courses/components/IndividualSubjects";
import { MCQQA } from "./mcgQA";
import styles from "./styles .module.css";
import { supabase } from "../../utils/supabase";
import toast from "react-hot-toast";

// Define a type for the response data
type ReadData = {
  image_urls: any[]; // Consider specifying a more precise type than any if possible
  text?: string;
};

export const PdfReader = () => {
  // Initialize readData with a type annotation
  const [readData, setReadData] = useState<ReadData | undefined>(undefined);
  const setpdfText = useModuleStore((state) => state.setpdfText);
  const setPdfImages = useModuleStore((state) => state.setPdfImages);
  const courseID = useModuleStore((state) => state.courseID);

  const setModules = useModuleStore((state) => state.setModules);
  const modules = useModuleStore.getState().modules;
  const moduleID = useModuleStore.getState().moduleID;

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const fetchData = async () => {
    let { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseID)
      .single();
    if (error) {
      throw error.message;
    } else if (courses) {
      setModules(courses.modules);
      return courses;
    }
  };
  function uploadResume() {
    const resumeInput = document.getElementById(
      "resumeInput"
    ) as HTMLInputElement;
    if (resumeInput && resumeInput.files && resumeInput.files.length > 0) {
      const formData = new FormData();
      formData.append("pdf_file", resumeInput.files[0]);

      fetch("http://127.0.0.1:8000/pdf/extract/", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          displayResponse(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      console.log("No file selected.");
    }
  }

  async function displayResponse(data: ReadData) {
    setReadData(data);
    setpdfText(data?.text!);
    setPdfImages(data.image_urls);

    const module = modules.filter((mod) => mod.id === moduleID);
    const updatedModule = { ...module[0], pdf: data };
    const filteredModules = modules.filter(
      (mod) => mod.id !== updatedModule.id
    );
    const updatedModules = [...filteredModules, updatedModule];

    const { data: updatedData, error } = await supabase
      .from("courses")
      .update({ modules: updatedModules })
      .eq("id", courseID)
      .select();
    if (error) {
      toast.error(error.message);
    } else if (updatedData) {
      toast.success("PDF added to Module");
      setRefresh(!refresh);
    }
  }

  return (
    <div className={styles.pdfuploaderSec} style={{}}>
      <input type="file" id="resumeInput" name="resume" />
      <button className={styles.uploaderButton} onClick={uploadResume}>
        Upload Pdf
      </button>
      {readData?.text && <p style={{ color: "black" }}>{readData.text}</p>}
      {readData?.image_urls &&
        readData.image_urls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Extracted Image ${index + 1}`}
            style={{ maxWidth: "100%", marginTop: "10px" }}
          />
        ))}
      <GenerateQA text={readData?.text} />
      <MCQQA text={readData?.text} />
    </div>
  );
};
