import { NavLink } from 'react-router';
import { Newspaper, Users, Swords, Check } from 'lucide-react';

const pages = {
  feed: {
    title: 'Feed',
    icon: Newspaper,
    text: 'Share your progress and see what other learners are solving.',
    items: [
      'Post updates and solved problems',
      'Follow other users',
      'Like and comment on posts',
    ],
  },
  group: {
    title: 'Group',
    icon: Users,
    text: 'Practice together with friends or classmates.',
    items: [
      'Create or join a group',
      'See each member\'s solved problems',
      'Group leaderboard',
    ],
  },
  arena: {
    title: 'DSA Arena',
    icon: Swords,
    text: 'Compete with other users on timed problems.',
    items: [
      'Timed head-to-head contests',
      'Live rankings',
      'Ratings that change after each match',
    ],
  },
};

function ComingSoon({ page }) {
  const { title, icon: Icon, text, items } = pages[page] || pages.feed;

  return (
    <div className="page-container max-w-2xl py-12">
      <div className="surface-card flex flex-col items-center p-8 text-center sm:p-12">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Icon size={30} />
        </span>
        <span className="badge badge-soft badge-primary mt-5">Coming soon</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-base-content/60">{text}</p>

        <ul className="mt-6 space-y-2 text-left text-sm">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check size={16} className="shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>

        <NavLink to="/" className="btn btn-primary mt-8">
          Back to problems
        </NavLink>
      </div>
    </div>
  );
}

export default ComingSoon;