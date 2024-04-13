import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../../utils/supabase";
import AddModuleModal from "./addModuleModal";
import styles from "../index.module.css";

export const IndividualSubjects = () => {
  const { id } = useParams();
  const [refresh, setRefresh] = useState(false);
  const [data, setData] = useState<CoursesDB>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [moduleID, setModuleID] = useState();

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const fetchData = async () => {
    let { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      throw error.message;
    } else if (courses) {
      setData(courses);
      return courses;
    }
  };
  return (
    <div>
      <div>
        <h1>{data?.name}</h1>
        <div>
          {data?.modules?.map((module) => (
            <div
              key={module.id}
              className={styles.Individual}
              onClick={() => {
                setIsEdit(true)
                setModuleID(module.id)
              }}
            >
              {module.name}
              <span>{module.yt_link}</span>
              <p>{module.description}</p>
            </div>
          ))}
          <AddModuleModal
            isOpen={isEdit}
            onClose={() => setIsEdit(false)}
            refresh={() => setRefresh(!refresh)}
            id={id!}
            moduleID={moduleID}
            modules={data?.modules!}
            isEdit={isEdit}
          />
        </div>
      </div>
      <div>
        <button onClick={() => setIsModalOpen(true)}>Add a course</button>
        <AddModuleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          refresh={() => setRefresh(!refresh)}
          id={id!}
          modules={data?.modules!}
          isEdit={false}
        />
      </div>
    </div>
  );
};