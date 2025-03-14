import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import { manageProject, managePurpose, getProjects, getPurposes } from "../../api/masterApi";

const ProjectAndPurpose = () => {
  const [ngoID, setNgoID] = useState(null);
  const [createdBy, setUserID] = useState(null);
  const [projects, setProjects] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingPurpose, setEditingPurpose] = useState(null);
  

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.NGO_ID && userData?.USER_ID) {
      setNgoID(userData.NGO_ID);
      setUserID(userData.USER_ID);
      loadProjects(userData.NGO_ID);
    }
  }, []);

  const { register: registerProject, handleSubmit: handleSubmitProject, reset: resetProject, setValue } = useForm();
  const { register: registerPurpose, handleSubmit: handleSubmitPurpose, reset: resetPurpose } = useForm();

  useEffect(() => {
    if (editingProject) {
      setValue("projectName", editingProject.projectName || editingProject.PROJECT_NAME);
    }
  }, [editingProject, setValue]);

  const loadProjects = async (ngoID) => {
    try {
      setLoading(true);
      const fetchedProjects = await getProjects(ngoID);
      if (Array.isArray(fetchedProjects)) {
        setProjects(fetchedProjects);
      } else {
        setProjects([]); // Ensure projects is always an array
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects.");
      setLoading(false);
    }
  };

  const loadPurposes = async (ngoID, projectID) => {
    try {
      setLoading(true);
      const fetchedPurposes = await getPurposes(ngoID, projectID);
      setPurposes(fetchedPurposes);
      setLoading(false);
    } catch (error) {
      console.error("Error loading purposes:", error);
      toast.error("Failed to load purposes.");
      setLoading(false);
    }
  };

  const onSubmitProject = async (data) => {
    try {
      setLoading(true);
      let formData = new FormData();
      formData.append("ngoID", ngoID);
      formData.append("projectName", data.projectName);
      formData.append("createdBy", createdBy);
  
      let response;
      if (editingProject) {
        formData.append("projectID", Number(editingProject.PROJECT_ID));
        response = await manageProject(formData, "u"); 
        setProjects((prev) =>
          prev.map((proj) =>
            proj.PROJECT_ID === editingProject.PROJECT_ID ? { ...proj, projectName: data.projectName } : proj
          )
        );
      } else {
        response = await manageProject(formData, "s"); 
        setProjects((prev) => [
          ...prev,
          { PROJECT_ID: response.projectID, projectName: data.projectName, ngoName: "Your NGO Name" }, 
        ]);
      }
  
      toast.success(editingProject ? "Project updated successfully" : "Project added successfully");
      setEditingProject(null);
      resetProject();
    } catch (error) {
      toast.error(error.message || "Failed to save project.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (index) => {
    setEditingProject(projects[index]);
  };  
  

  const onSubmitPurpose = async (data) => {
    try {
      setLoading(true);
      let formData = new FormData();
      formData.append("ngoID", ngoID);
      formData.append("projectID", Number(data.projectID)); 
      formData.append("purposeName", data.purposeName);
      formData.append("createdBy", createdBy);
      if (editingPurpose) {
        formData.append("purposeID", Number(editingPurpose.PURPOSE_ID));
        await managePurpose(formData, "u"); 
      } else {
        await managePurpose(formData, "s"); 
      }

      toast.success(editingPurpose ? "Purpose updated successfully" : "Purpose added successfully");
      setEditingPurpose(null);
      resetPurpose();
      loadPurposes(ngoID, data.projectID);
    } catch (error) {
      toast.error(error.message || "Failed to save purpose.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-center min-h-screen bg-gray-100 py-10 gap-10">
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border relative">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Project Registration</h2>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        )}
        <form onSubmit={handleSubmitProject(onSubmitProject)} className="grid grid-cols-1 gap-6 mb-8">
        <input  {...registerProject("projectName")} placeholder="Enter project name" className="border p-3 rounded-lg w-full"/>
          <button type="submit" className={`p-3 rounded-lg w-full ${editingProject ? "bg-yellow-600" : "bg-blue-600"} text-white`}>
            {editingProject ? "Update" : "Submit"}
          </button>
        </form>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Project List</h2>
        {projects.length > 0 ? (
          <table className="w-full table-auto border-collapse shadow-lg rounded-lg">
            <thead>
              <tr className="bg-yellow-600 text-white">
                <th className="px-6 py-3 text-left border-b">Project Name</th>
                <th className="px-6 py-3 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="px-6 py-3 text-left font-semibold">{project.projectName || project.PROJECT_NAME}</td>
                  <td className="px-6 py-3 text-left flex space-x-4">
                    <button onClick={() => handleEditProject(index)} className="text-blue-600 hover:opacity-75">
                      <FaEdit size={18} />
                    </button>
                    <button onClick={() => setProjects(projects.filter((_, i) => i !== index))} className="text-red-600 hover:opacity-75">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600 text-center">No projects added yet.</p>
        )}
      </div>
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border relative">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Purpose Registration</h2>
        <form onSubmit={handleSubmitPurpose(onSubmitPurpose)} className="grid grid-cols-1 gap-6 mb-8">
          <select {...registerPurpose("projectID")} className="border p-3 rounded-lg w-full">
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.PROJECT_ID} value={project.PROJECT_ID}>{project.projectName}</option>
            ))}
          </select>
          <input {...registerPurpose("purposeName")} placeholder="Enter purpose name" className="border p-3 rounded-lg w-full" />
          <button type="submit" className={`p-3 rounded-lg w-full ${editingPurpose !== null ? "bg-yellow-600" : "bg-green-600"} text-white`}>
            {editingPurpose !== null ? "Update" : "Submit"}
          </button>
        </form>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Purpose List</h2>
        {purposes.length > 0 ? (
          <table className="w-full table-auto border-collapse shadow-lg rounded-lg">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-6 py-3 text-left border-b">Project Name</th>
                <th className="px-6 py-3 text-left border-b">Purpose Name</th>
                <th className="px-6 py-3 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purposes.map((purpose, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="px-6 py-3 text-left">{purpose.projectName || "N/A"}</td>
                  <td className="px-6 py-3 text-left font-semibold">{purpose.purposeName}</td>
                  <td className="px-6 py-3 text-left flex space-x-4">
                    <button onClick={() => handleEditPurpose(index)} className="text-blue-600 hover:opacity-75">
                      <FaEdit size={18} />
                    </button>
                    <button onClick={() => handleDeletePurpose(index)} className="text-red-600 hover:opacity-75">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600 text-center">No purposes added yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectAndPurpose;