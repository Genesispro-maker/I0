"use client"
import { useEffect, useState } from 'react';

export default function ExplorePage() {
    const [projects, setProjects] = useState<{id: string, title: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/explore');
                const data = await response.json();
                
                // Handle both response formats
                const projectsData = data.projects || data;
                setProjects(Array.isArray(projectsData) ? projectsData : []);
            } catch (err) {
                setError(err.message ?? "something went wrong");
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) return <div>Loading projects...</div>;
    if (error) return <div>Error: {error}</div>;

    if(projects.length === 0) return <h1>no projects</h1>

    return (
        <main>
            <ul>
                {projects.map((p) => (
                    <div key={p.id}>{p.title}</div>
                ))}
            </ul>
        </main>
    );
}