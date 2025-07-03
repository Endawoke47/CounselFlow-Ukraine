import { Link, useMatches } from '@tanstack/react-router';

const breadcrumbMap: Record<string, string> = {
  __root__: 'Home',
  '/dashboard': 'Dashboard',
  '/account': 'Account',
  '/project/$projectId': 'Project Details',
  '/project/$projectId/dashboard': 'Dashboard',
  '/project/$projectId/schedules': 'Risks',
};

const Breadcrumbs = () => {
  const matches = useMatches();

  return (
    <nav className="text-gray-500 text-sm flex items-center gap-2 my-[40px]">
      {matches.map((match, index) => {
        const isLast = index === matches.length - 1;
        let label = breadcrumbMap[match.routeId] || match.routeId;

        if (
          match.routeId.includes('$projectId') &&
          match.params?.projectId &&
          match.routeId.split('/').length < 3
        ) {
          label = `Project ${match.params?.projectId}`;
        }

        return (
          <div key={match.id} className="flex items-center">
            {index > 0 && (
              <img
                src="/icons/chevron-right.png"
                alt="arrow right"
                width={16}
                height={16}
              />
            )}
            {!isLast ? (
              <Link
                to={
                  match.routeId === '/project/$projectId'
                    ? '/project/$projectId/dashboard'
                    : match.pathname
                }
                className="text-blue-600 hover:underline"
              >
                {label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
