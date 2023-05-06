import * as React from "react";

import clsx from "clsx";

function ContainerLayout({ className, children, ...rest }, ref) {
  return (
    <div
      className={clsx("w-full sm:max-w-xl mx-auto", className)}
      ref={ref}
      {...rest}
    >
      {children}
    </div>
  );
}

ContainerLayout.displayName = "Container";

export default React.forwardRef(ContainerLayout);
