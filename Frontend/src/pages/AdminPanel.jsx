import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, NavLink } from 'react-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

// Zod schema matching the backend problem schema.
// Values here MUST match the enums in Backend/src/models/problem.js exactly.
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  tags: z.enum(['Array', 'LinkedList', 'graph', 'String', 'dp', 'queue']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

const languageNames = ['C++', 'Java', 'JavaScript'];

// Small presentational helper for validation messages
const FieldError = ({ message }) =>
  message ? <span className="mt-1 block text-sm text-error">{message}</span> : null;

// Section wrapper used for each block of the form
const Section = ({ title, description, children }) => (
  <section className="surface-card p-6">
    <div className="mb-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-base-content/60">{description}</p>
      )}
    </div>
    {children}
  </section>
);

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'Easy',
      tags: 'Array',
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      // The backend usually replies with a plain text message
      const serverData = error.response?.data;
      const message =
        typeof serverData === 'string' && serverData
          ? serverData
          : serverData?.message || error.message;
      alert(`Error: ${message}`);
    }
  };

  // Show validation problems that are not attached to a visible field
  const onInvalid = (formErrors) => {
    console.warn('Form validation errors:', formErrors);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="page-container max-w-4xl py-8">
        <NavLink to="/admin" className="btn btn-ghost btn-sm mb-6 gap-1.5">
          <ArrowLeft size={16} />
          Back to admin
        </NavLink>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create new problem</h1>
          <p className="mt-1 text-base-content/60">
            Fill in the details, test cases and code templates for the problem.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
          {/* Basic Information */}
          <Section title="Basic information">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
                  Title
                </label>
                <input
                  id="title"
                  {...register('title')}
                  className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  className={`textarea textarea-bordered h-40 w-full ${
                    errors.description ? 'textarea-error' : ''
                  }`}
                />
                <FieldError message={errors.description?.message} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="difficulty" className="mb-1.5 block text-sm font-medium">
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    {...register('difficulty')}
                    className={`select select-bordered w-full ${
                      errors.difficulty ? 'select-error' : ''
                    }`}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="mb-1.5 block text-sm font-medium">
                    Tag
                  </label>
                  <select
                    id="tags"
                    {...register('tags')}
                    className={`select select-bordered w-full ${errors.tags ? 'select-error' : ''}`}
                  >
                    <option value="Array">Array</option>
                    <option value="LinkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="String">String</option>
                    <option value="dp">DP</option>
                    <option value="queue">Queue</option>
                  </select>
                </div>
              </div>
            </div>
          </Section>

          {/* Visible Test Cases */}
          <Section
            title="Visible test cases"
            description="Shown to users as examples and used by the Run button."
          >
            <div className="space-y-4">
              {visibleFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-box border border-base-300 bg-base-200/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Case {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="btn btn-ghost btn-xs gap-1 text-error"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>

                  <div>
                    <input
                      {...register(`visibleTestCases.${index}.input`)}
                      placeholder="Input"
                      className="input input-bordered w-full font-mono text-sm"
                    />
                    <FieldError message={errors.visibleTestCases?.[index]?.input?.message} />
                  </div>

                  <div>
                    <input
                      {...register(`visibleTestCases.${index}.output`)}
                      placeholder="Output"
                      className="input input-bordered w-full font-mono text-sm"
                    />
                    <FieldError message={errors.visibleTestCases?.[index]?.output?.message} />
                  </div>

                  <div>
                    <textarea
                      {...register(`visibleTestCases.${index}.explanation`)}
                      placeholder="Explanation"
                      className="textarea textarea-bordered w-full"
                    />
                    <FieldError message={errors.visibleTestCases?.[index]?.explanation?.message} />
                  </div>
                </div>
              ))}

              <FieldError
                message={errors.visibleTestCases?.message || errors.visibleTestCases?.root?.message}
              />

              <button
                type="button"
                onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="btn btn-outline btn-sm gap-1.5"
              >
                <Plus size={16} />
                Add visible case
              </button>
            </div>
          </Section>

          {/* Hidden Test Cases */}
          <Section
            title="Hidden test cases"
            description="Used to check submissions. Users never see these."
          >
            <div className="space-y-4">
              {hiddenFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-box border border-base-300 bg-base-200/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Case {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="btn btn-ghost btn-xs gap-1 text-error"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>

                  <div>
                    <input
                      {...register(`hiddenTestCases.${index}.input`)}
                      placeholder="Input"
                      className="input input-bordered w-full font-mono text-sm"
                    />
                    <FieldError message={errors.hiddenTestCases?.[index]?.input?.message} />
                  </div>

                  <div>
                    <input
                      {...register(`hiddenTestCases.${index}.output`)}
                      placeholder="Output"
                      className="input input-bordered w-full font-mono text-sm"
                    />
                    <FieldError message={errors.hiddenTestCases?.[index]?.output?.message} />
                  </div>
                </div>
              ))}

              <FieldError
                message={errors.hiddenTestCases?.message || errors.hiddenTestCases?.root?.message}
              />

              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="btn btn-outline btn-sm gap-1.5"
              >
                <Plus size={16} />
                Add hidden case
              </button>
            </div>
          </Section>

          {/* Code Templates */}
          <Section
            title="Code templates"
            description="Starter code and a full reference solution for each language. Both must read input from stdin and print the result, because the judge runs them as complete programs."
          >
            <div className="space-y-8">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-4">
                  <span className="badge badge-soft badge-primary font-medium">
                    {languageNames[index]}
                  </span>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Initial code</label>
                    <textarea
                      {...register(`startCode.${index}.initialCode`)}
                      spellCheck={false}
                      rows={8}
                      className="textarea textarea-bordered w-full bg-base-300 font-mono text-sm leading-relaxed"
                    />
                    <FieldError message={errors.startCode?.[index]?.initialCode?.message} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Reference solution</label>
                    <textarea
                      {...register(`referenceSolution.${index}.completeCode`)}
                      spellCheck={false}
                      rows={8}
                      className="textarea textarea-bordered w-full bg-base-300 font-mono text-sm leading-relaxed"
                    />
                    <FieldError message={errors.referenceSolution?.[index]?.completeCode?.message} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting && <span className="loading loading-spinner loading-sm" />}
            Create problem
          </button>
        </form>
      </div>
    </div>
  );
}


export default AdminPanel;