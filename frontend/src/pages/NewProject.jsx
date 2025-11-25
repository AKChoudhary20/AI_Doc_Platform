import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FileText, Presentation, Wand2, Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const NewProject = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        document_type: '', // 'docx' or 'pptx'
        topic: '',
        outline: [] // List of strings (headers or slide titles)
    });

    const handleTypeSelect = (type) => {
        setFormData({ ...formData, document_type: type });
        setStep(2);
    };

    const handleTopicSubmit = async (e) => {
        e.preventDefault();
        if (!formData.topic) return;
        setStep(3);
    };

    const handleAiSuggest = async () => {
        setLoading(true);
        try {
            const response = await api.post('/generation/suggest-outline', {
                topic: formData.topic,
                document_type: formData.document_type
            });
            setFormData({ ...formData, outline: response.data.outline });
        } catch (error) {
            console.error("Failed to suggest outline", error);
            alert("Failed to generate outline. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const addOutlineItem = () => {
        setFormData({ ...formData, outline: [...formData.outline, "New Section"] });
    };

    const updateOutlineItem = (index, value) => {
        const newOutline = [...formData.outline];
        newOutline[index] = value;
        setFormData({ ...formData, outline: newOutline });
    };

    const removeOutlineItem = (index) => {
        const newOutline = formData.outline.filter((_, i) => i !== index);
        setFormData({ ...formData, outline: newOutline });
    };

    const handleCreateProject = async () => {
        setLoading(true);
        try {
            // 1. Create Project
            const projectRes = await api.post('/projects/', {
                title: formData.title || formData.topic, // Default title to topic if empty
                document_type: formData.document_type,
                topic: formData.topic
            });
            const projectId = projectRes.data.id;

            // 2. Save Outline (We need an endpoint for this, or save it with project creation)
            // For now, let's assume we save sections individually or via a bulk endpoint
            // I'll implement a bulk section creation endpoint next.
            await api.post(`/projects/${projectId}/sections/bulk`, {
                sections: formData.outline.map((title, index) => ({
                    title,
                    order_index: index
                }))
            });

            navigate(`/editor/${projectId}`);
        } catch (error) {
            console.error("Failed to create project", error);
            alert("Failed to create project.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">Create New Project</h1>
                        <span className="text-sm text-gray-500">Step {step} of 3</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-xl font-semibold mb-6">Choose Document Type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => handleTypeSelect('docx')}
                                className="p-8 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center gap-4 group"
                            >
                                <div className="p-4 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition">
                                    <FileText size={32} />
                                </div>
                                <span className="font-medium text-lg">Word Document (.docx)</span>
                            </button>
                            <button
                                onClick={() => handleTypeSelect('pptx')}
                                className="p-8 border-2 border-gray-100 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition flex flex-col items-center gap-4 group"
                            >
                                <div className="p-4 bg-orange-100 text-orange-600 rounded-full group-hover:scale-110 transition">
                                    <Presentation size={32} />
                                </div>
                                <span className="font-medium text-lg">PowerPoint (.pptx)</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-xl font-semibold mb-6">What is this document about?</h2>
                        <form onSubmit={handleTopicSubmit}>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Project Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Q3 Financial Report"
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Topic / Prompt</label>
                                <textarea
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    placeholder="e.g., A comprehensive market analysis of the electric vehicle industry in 2025..."
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                Next <ArrowRight size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">
                                {formData.document_type === 'docx' ? 'Outline Structure' : 'Slide Structure'}
                            </h2>
                            <button
                                onClick={handleAiSuggest}
                                disabled={loading}
                                className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                                AI Suggest
                            </button>
                        </div>

                        <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2">
                            {formData.outline.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 group">
                                    <span className="text-gray-400 font-mono w-6">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateOutlineItem(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <button
                                        onClick={() => removeOutlineItem(index)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {formData.outline.length === 0 && (
                                <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                                    No items yet. Use AI Suggest or add manually.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={addOutlineItem}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 transition mb-6 flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Add Item
                        </button>

                        <button
                            onClick={handleCreateProject}
                            disabled={loading || formData.outline.length === 0}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Project...' : 'Create Project & Start Generation'}
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default NewProject;
