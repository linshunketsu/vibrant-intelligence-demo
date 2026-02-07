// Form Templates Home Component
// Displays form templates and existing forms
// Migrated from vibrant-intelligence-form-builder with Tailwind CSS

import React, { useState, useMemo } from 'react';
import { FormTemplate, FormField } from '../../formTypes';
import { FormPreview } from './FormPreview';
import { INITIAL_FORM_TEMPLATES } from '../../formConstants';
import { Plus, Trash2, FileText, X, Search } from 'lucide-react';

interface FormTemplatesHomeProps {
  onNavigate: (view: 'builder', fields?: FormField[], formId?: string) => void;
  existingForms: FormTemplate[];
  onDeleteForm: (formId: string) => void;
}

const TemplateCard: React.FC<{
  template: FormTemplate;
  onPreview: () => void;
}> = ({ template, onPreview }) => (
  <button
    onClick={onPreview}
    className="w-full text-left p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    <div className="flex-grow">
      <h4 className="font-bold text-slate-800 text-lg">{template.title}</h4>
      <p className="text-sm text-slate-500 mt-1">{template.description}</p>
    </div>
    <div className="mt-4">
      <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{template.category}</span>
    </div>
  </button>
);

export const FormTemplatesHome: React.FC<FormTemplatesHomeProps> = ({
  onNavigate,
  existingForms,
  onDeleteForm
}) => {
  const [previewingTemplate, setPreviewingTemplate] = useState<FormTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const templates = INITIAL_FORM_TEMPLATES;

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
              My Practice&apos;s Forms
            </h2>
            <p className="mt-2 text-lg text-slate-500">
              Manage your practice&apos;s active EHR forms or create a new one from scratch.
            </p>
          </div>
          <button
            onClick={() => onNavigate('builder')}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
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
                      onClick={() => onNavigate('builder', form.fields, form.id)}
                      className="px-3 py-2 sm:px-4 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm transition-colors"
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
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-lg bg-white">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
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
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-blue-100 hover:text-blue-700 border border-slate-200'
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all">
            <div className="p-6 border-b border-slate-200 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{previewingTemplate.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{previewingTemplate.description}</p>
              </div>
              <button onClick={() => setPreviewingTemplate(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 flex-grow overflow-y-auto">
              <div className="space-y-4">
                {previewingTemplate.fields.map(field => (
                  <div key={field.id} className="p-4 bg-slate-50 rounded-md border border-slate-200">
                    <FormPreview field={field} />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
              <button
                onClick={() => {
                  onNavigate('builder', previewingTemplate.fields);
                  setPreviewingTemplate(null);
                }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
