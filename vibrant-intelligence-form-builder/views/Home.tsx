import React, { useState, useMemo } from 'react';
import type { View } from '../App';
import { FormField, FormTemplate } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { RenderedFormComponent } from '../components/RenderedFormComponent';
import { XIcon } from '../components/icons/XIcon';

interface HomeProps {
  onNavigate: (view: View, fields?: FormField[], formId?: string) => void;
  existingForms: FormTemplate[];
  onDeleteForm: (formId: string) => void;
  templates: FormTemplate[];
}

interface TemplateCardProps {
    template: FormTemplate;
    onPreview: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview }) => (
    <button 
      onClick={onPreview} 
      className="w-full text-left p-5 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
        <div className="flex-grow">
          <h4 className="font-bold text-slate-800 text-lg">{template.title}</h4>
          <p className="text-sm text-slate-500 mt-1">{template.description}</p>
        </div>
        <div className="mt-4">
          <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-1 rounded-full">{template.category}</span>
        </div>
    </button>
);


const Home: React.FC<HomeProps> = ({ onNavigate, existingForms, onDeleteForm, templates }) => {
  const [previewingTemplate, setPreviewingTemplate] = useState<FormTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => ['All', ...new Set(templates.map(t => t.category))], [templates]);

  const filteredTemplates = useMemo(() => {
    return templates
      .filter(template => {
        if (activeCategory === 'All') return true;
        return template.category === activeCategory;
      })
      .filter(template => {
        const query = searchQuery.toLowerCase();
        return (
          template.title.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query)
        );
      });
  }, [templates, activeCategory, searchQuery]);
  
  return (
    <div className="space-y-12">
      {/* My Forms Section */}
      <div>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">
                My Practice's Forms
            </h2>
            <p className="mt-2 text-lg text-slate-500">
                Manage your practice's active EHR forms or create a new one from scratch.
            </p>
          </div>
          <button
            onClick={() => onNavigate('manual')}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            <PlusIcon />
            Create New Form
          </button>
        </div>

        {existingForms.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-slate-200">
            <ul className="divide-y divide-slate-200">
              {existingForms.map(form => (
                <li key={form.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-slate-800">{form.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl">{form.description}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 ml-4 flex-shrink-0">
                    <button
                      onClick={() => onNavigate('manual', form.fields, form.id)}
                      className="px-3 py-2 sm:px-4 text-primary-700 font-semibold rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm transition-colors"
                    >
                      View / Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${form.title}"? This action cannot be undone.`)) {
                          onDeleteForm(form.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                      aria-label={`Delete ${form.title}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-lg bg-white">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No forms found</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new form or using a template.</p>
          </div>
        )}
      </div>

      {/* Template Library Section */}
      <div className="bg-slate-100/70 p-6 sm:p-8 rounded-2xl border border-slate-200">
        <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">
                Start from a Template
            </h2>
            <p className="mt-2 text-lg text-slate-500">
                Save time by using a professionally designed template as a starting point.
            </p>
        </div>

         {/* Filter and Search Controls */}
        <div className="mb-8 sticky top-4 bg-slate-100/80 backdrop-blur-md z-10 py-4 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
                <input 
                    type="search"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                            activeCategory === category 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-white text-slate-600 hover:bg-primary-100 hover:text-primary-700 border border-slate-200'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>

        {/* Template Grid */}
        {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                    <TemplateCard 
                        key={template.id} 
                        template={template} 
                        onPreview={() => setPreviewingTemplate(template)}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-lg bg-white">
                <h3 className="mt-2 text-sm font-medium text-slate-900">No templates found</h3>
                <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
            </div>
        )}

      </div>
       {/* Preview Modal */}
       {previewingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">{previewingTemplate.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{previewingTemplate.description}</p>
                      </div>
                      <button onClick={() => setPreviewingTemplate(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                          <XIcon />
                      </button>
                  </div>
                  <div className="p-6 flex-grow overflow-y-auto">
                      <div className="space-y-4">
                        {previewingTemplate.fields.map(field => (
                            <div key={field.id} className="p-4 bg-slate-50 rounded-md border border-slate-200">
                                <RenderedFormComponent field={field} />
                            </div>
                        ))}
                      </div>
                  </div>
                  <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                      <button
                          onClick={() => {
                              onNavigate('manual', previewingTemplate.fields);
                              setPreviewingTemplate(null);
                          }}
                          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                          Use This Template
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Home;