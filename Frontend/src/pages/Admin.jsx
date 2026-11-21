import React from 'react';
import { Plus, Edit, Trash2, Video, ArrowLeft, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      iconStyle: 'bg-success/15 text-success',
      hoverBorder: 'hover:border-success/50',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      iconStyle: 'bg-warning/15 text-warning',
      hoverBorder: 'hover:border-warning/50',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      iconStyle: 'bg-error/15 text-error',
      hoverBorder: 'hover:border-error/50',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload and delete problem videos',
      icon: Video,
      iconStyle: 'bg-info/15 text-info',
      hoverBorder: 'hover:border-info/50',
      route: '/admin/video'
    }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <div className="page-container py-8">
        <NavLink to="/" className="btn btn-ghost btn-sm mb-6 gap-1.5">
          <ArrowLeft size={16} />
          Back to problems
        </NavLink>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Admin panel</h1>
          <p className="mt-1 text-base-content/60">
            Manage the coding problems on your platform.
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <NavLink
                key={option.id}
                to={option.route}
                className={`surface-card group flex flex-col gap-4 p-6 hover:shadow-lg ${option.hoverBorder}`}
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-xl ${option.iconStyle}`}
                >
                  <IconComponent size={24} />
                </span>

                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{option.title}</h2>
                  <p className="mt-1 text-sm text-base-content/60">
                    {option.description}
                  </p>
                </div>

                <span className="flex items-center gap-1 text-sm font-medium text-base-content/70 transition-colors group-hover:text-base-content">
                  Open
                  <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin;