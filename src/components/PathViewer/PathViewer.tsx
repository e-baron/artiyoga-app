import Breadcrumbs from '@mui/material/Breadcrumbs';


interface PathViewerProps {
  children: React.ReactNode;
}

const PathViewer = ({
  children,
}: PathViewerProps) => {
  return <Breadcrumbs aria-label="breadcrumb" >{children}</Breadcrumbs>;
};

export default PathViewer;
