import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Save, Wand2, ThumbsUp, ThumbsDown, MessageSquare, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Editor = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState({}); // Map of sectionId -> boolean

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const projectRes = await api.get(`/projects/${id}`);
                setProject(projectRes.data);
                // Fetch sections (assuming we have an endpoint or they come with project)
                // For now, let's assume project.sections is populated or we fetch them separately
                // We need to update the backend to return sections with the project or a separate endpoint
                const sectionsRes = await api.get(`/projects/${id}/sections`);
                setSections(sectionsRes.data);
            } catch (error) {
                console.error("Failed to fetch project data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectData();
    }, [id]);

    const handleGenerate = async (sectionId) => {
        setGenerating(prev => ({ ...prev, [sectionId]: true }));
        try {
            const response = await api.post(`/generation/section/${sectionId}`);
            // Update section content
            setSections(prev => prev.map(s =>
                s.id === sectionId ? { ...s, content: response.data.content } : s
            ));
        } catch (error) {
            console.error("Generation failed", error);
            alert("Failed to generate content.");
        } finally {
            setGenerating(prev => ({ ...prev, [sectionId]: false }));
        }
    };

    const handleRefine = async (sectionId, prompt) => {
        setGenerating(prev => ({ ...prev, [sectionId]: true }));
        try {
            const response = await api.post(`/generation/refine/${sectionId}`, { prompt });
            setSections(prev => prev.map(s =>
                s.id === sectionId ? { ...s, content: response.data.content } : s
            ));
        } catch (error) {
            console.error("Refinement failed", error);
        } finally {
            setGenerating(prev => ({ ...prev, [sectionId]: false }));
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get(`/export/${id}`, {
                responseType: 'blob', // Important for file download
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = project.document_type === 'docx' ? 'docx' : 'pptx';
            link.setAttribute('download', `${project.title}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export document.");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Project...</div>;
    if (!project) return <div className="p-8 text-center">Project not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{project.title}</h1>
                    <span className="text-sm text-gray-500 uppercase tracking-wider">{project.document_type === 'docx' ? 'Word Document' : 'PowerPoint Presentation'}</span>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <Save size={18} /> Save
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Export {project.document_type === 'docx' ? '.docx' : '.pptx'}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-8 space-y-6">
                {sections.map((section) => (
                    <SectionCard
                        key={section.id}
                        section={section}
                        onGenerate={() => handleGenerate(section.id)}
                        onRefine={(prompt) => handleRefine(section.id, prompt)}
                        isGenerating={generating[section.id]}
                    />
                ))}
            </main>
        </div>
    );
};

const SectionCard = ({ section, onGenerate, onRefine, isGenerating }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [showRefine, setShowRefine] = useState(false);

    return (
        <motion.div
            layout
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                        {section.order_index + 1}
                    </span>
                    {section.title}
                </h3>
                <button className="text-gray-400 hover:text-gray-600">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-6"
                    >
                        {section.content ? (
                            <div className="prose max-w-none mb-6">
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {section.content}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 mb-6">
                                <p className="text-gray-500 mb-4">No content generated yet.</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onGenerate(); }}
                                    disabled={isGenerating}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} />}
                                    Generate Content
                                </button>
                            </div>
                        )}

                        {/* Actions Toolbar */}
                        {section.content && (
                            <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                                <button
                                    onClick={() => setShowRefine(!showRefine)}
                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition"
                                >
                                    <Wand2 size={16} /> Refine with AI
                                </button>
                                <div className="flex items-center gap-2 ml-auto">
                                    <button className="p-2 text-gray-400 hover:text-green-600 transition"><ThumbsUp size={18} /></button>
                                    <button className="p-2 text-gray-400 hover:text-red-600 transition"><ThumbsDown size={18} /></button>
                                    <button className="p-2 text-gray-400 hover:text-blue-600 transition"><MessageSquare size={18} /></button>
                                </div>
                            </div>
                        )}

                        {/* Refine Input */}
                        {showRefine && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={refinePrompt}
                                    onChange={(e) => setRefinePrompt(e.target.value)}
                                    placeholder="e.g., Make it more formal, Shorten this..."
                                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                                <button
                                    onClick={() => { onRefine(refinePrompt); setRefinePrompt(''); setShowRefine(false); }}
                                    disabled={isGenerating || !refinePrompt}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    Apply
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Editor;
