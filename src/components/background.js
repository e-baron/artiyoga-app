import Image from "./image";

/**
 * this will be a section background by default
 * NB : currently, a section background cannot pass extra classes (only .section_background)
 *  */
const Background = ({ children, src, className }) => {
  // const classValue = `${className ? className : "section__background"}`;
  const classValue = `background ${className ? className : ""}`;

  return (
    <div className={classValue} >
      {  src && <Image src={src}/> }
      {children}
    </div>
  );
};

export default Background;
