import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, FileText, Presentation } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/projects/');
                setProjects(response.data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
                    <Link
                        to="/new-project"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        New Project
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 mb-4">No projects yet. Start creating!</p>
                        <Link
                            to="/new-project"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Create your first project
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${project.document_type === 'docx' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {project.document_type === 'docx' ? <FileText size={24} /> : <Presentation size={24} />}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    {project.document_type === 'docx' ? 'Word Document' : 'PowerPoint Presentation'}
                                </p>
                                <Link
                                    to={`/editor/${project.id}`}
                                    className="block w-full text-center py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Open Editor
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
