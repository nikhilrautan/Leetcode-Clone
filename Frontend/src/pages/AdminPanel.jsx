import { Link } from "react-router";

const actions = [
  {
    title: "Create Problem",
    description: "Add a new coding problem to the platform.",
    to: "/admin/create",
    button: "btn-success",
  },
  {
    title: "Update Problem",
    description: "Edit the details of an existing problem.",
    to: "/admin/update",
    button: "btn-warning",
  },
  {
    title: "Delete Problem",
    description: "Remove a problem from the platform.",
    to: "/admin/delete",
    button: "btn-error",
  },
];

function AdminPanel() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md px-4">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">
            Leetcode
          </Link>
        </div>
        <Link to="/" className="btn btn-outline btn-sm">
          Back to Problems
        </Link>
      </div>

      <div className="container mx-auto p-6 max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-2">Admin Panel</h1>
        <p className="text-center opacity-70 mb-10">
          Manage the coding problems on your platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action) => (
            <div key={action.title} className="card bg-base-100 shadow-md">
              <div className="card-body items-center text-center">
                <h2 className="card-title">{action.title}</h2>
                <p className="opacity-70">{action.description}</p>
                <div className="card-actions mt-4">
                  <Link to={action.to} className={`btn ${action.button}`}>
                    {action.title}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;