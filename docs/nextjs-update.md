Route Props Helpers
Next.js automatically generates globally available PageProps, LayoutProps, and RouteContext types with full parameter typing and no imports required:

Before: Manual typing and imports


import { Metadata } from 'next';
 
interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
  analytics: React.ReactNode; // Manual parallel route typing
  team: React.ReactNode; // Manual parallel route typing
}
 
export default function DashboardLayout(props: Props) {
  return (
    <div>
      {props.children}
      {props.analytics} {/* No type safety for parallel routes */}
      {props.team} {/* No type safety for parallel routes */}
    </div>
  );
}
After: Automatic typing with parallel route support


// No need to import LayoutProps - globally available
export default function DashboardLayout(props: LayoutProps<'/dashboard'>) {
  return (
    <div>
      {props.children}
      {props.analytics} {/* Fully typed parallel route slot */}
      {props.team} {/* Fully typed parallel route slot */}
    </div>
  );
}
The system automatically discovers routes from your file structure, supporting dynamic routes, parallel routes, and custom routes from next.config.js. Type generation runs in both development and build modes, immediately regenerating types when your file structure changes in development, and scales efficiently to large projects by generating only a few optimized files instead of the many individual files used in the previous implementation.