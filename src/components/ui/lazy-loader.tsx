import { Suspense } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type LazyLoadType =
  | "list"
  | "list-item"
  | "text"
  | "article"
  | "lines"
  | "line"
  | "chart"
  | "asset-pairs"
  | "pool-row"
  | "circle";

interface LazyLoadProps {
  children: ReactNode;
  type?: LazyLoadType;
  className?: string;
  isLoading?: boolean;
}

const ListItemSkeleton = ({ index = 0 }: { index?: number }) => (
  <motion.div
    initial={{ opacity: 0.3 }}
    animate={{ opacity: [0.3, 0.7, 0.3] }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      delay: index * 0.1,
    }}
  >
    <div className="mb-4 flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 rounded bg-loader"></div>
          <div className="h-4 w-16 rounded bg-loader"></div>
        </div>
        <div className="h-6 w-3/4 rounded bg-loader"></div>
        <div className="h-4 w-1/4 rounded bg-loader"></div>
      </div>
    </div>
  </motion.div>
);

const ListSkeleton = () => (
  <div className="space-y-4 divide-x divide-muted">
    {Array.from({ length: 3 }).map((_, index) => (
      <ListItemSkeleton key={index} index={index} />
    ))}
  </div>
);

const TextSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: index * 0.2,
        }}
        className="space-y-2"
      >
        <div className="h-4 w-full rounded bg-loader"></div>
        <div className="h-4 w-5/6 rounded bg-loader"></div>
        <div className="h-4 w-4/6 rounded bg-loader"></div>
      </motion.div>
    ))}
  </div>
);

const ArticleSkeleton = () => (
  <motion.div
    initial={{ opacity: 0.3 }}
    animate={{ opacity: [0.3, 0.7, 0.3] }}
    transition={{ duration: 1.8, repeat: Infinity }}
    className="space-y-6"
  >
    {/* Header */}
    <div className="space-y-3">
      <div className="h-8 w-3/4 rounded bg-loader"></div>
      <div className="h-4 w-1/3 rounded bg-loader"></div>
    </div>

    {/* Meta info */}
    <div className="flex gap-4">
      <div className="h-4 w-24 rounded bg-loader"></div>
      <div className="h-4 w-20 rounded bg-loader"></div>
      <div className="h-4 w-28 rounded bg-loader"></div>
    </div>

    {/* Content blocks */}
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 w-full rounded bg-loader"></div>
          <div className="h-4 w-11/12 rounded bg-loader"></div>
          <div className="h-4 w-5/6 rounded bg-loader"></div>
        </div>
      ))}
    </div>
  </motion.div>
);

const SingleLineSkeleton = () => (
  <motion.div
    initial={{ opacity: 0.3 }}
    animate={{ opacity: [0.3, 0.7, 0.3] }}
    transition={{ duration: 1.2, repeat: Infinity }}
    className="h-full w-full rounded bg-loader"
  />
);

const LinesSkeleton = () => (
  <div className="space-y-3">
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 1.2, repeat: Infinity }}
      className="h-4 w-full rounded bg-loader"
    />
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
      className="h-4 w-3/4 rounded bg-loader"
    />
  </div>
);

// TODO: fix Math.random()
const ChartSkeleton = () => (
  <motion.div
    initial={{ opacity: 0.3 }}
    animate={{ opacity: [0.3, 0.7, 0.3] }}
    transition={{ duration: 2, repeat: Infinity }}
    className="flex h-full min-h-16 w-full flex-col space-y-4"
  >
    {/* Chart container */}
    <div className="flex flex-1 items-end justify-between space-x-2 rounded-md bg-loader p-4">
      {/* Chart bars/elements */}
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ height: "20%" }}
          animate={{ height: ["20%", `${Math.random() * 80 + 20}%`, "20%"] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.1,
          }}
          className="flex-1 rounded-t bg-loader"
        />
      ))}
    </div>
  </motion.div>
);

const CircleSkeleton = () => (
  <motion.div
    initial={{ opacity: 0.3 }}
    animate={{ opacity: [0.3, 0.7, 0.3] }}
    transition={{ duration: 1.2, repeat: Infinity }}
    className="h-full w-full rounded-full bg-loader"
  />
);

const LoadingSkeleton = ({ type }: { type: LazyLoadType }) => {
  switch (type) {
    case "list":
      return <ListSkeleton />;
    case "list-item":
      return <ListItemSkeleton />;
    case "text":
      return <TextSkeleton />;
    case "article":
      return <ArticleSkeleton />;
    case "line":
      return <SingleLineSkeleton />;
    case "lines":
      return <LinesSkeleton />;
    case "chart":
      return <ChartSkeleton />;
    case "circle":
      return <CircleSkeleton />;
    default:
      return <ListSkeleton />;
  }
};

const LazyLoader = ({
  children,
  type = "line",
  className = "",
  isLoading = false,
}: LazyLoadProps) => {
  // Table-compatible types that shouldn't be wrapped in divs
  const isTableCompatible = type === "pool-row";

  if (isLoading) {
    if (isTableCompatible) {
      return <LoadingSkeleton type={type} />;
    }
    return (
      <div className={className}>
        <LoadingSkeleton type={type} />
      </div>
    );
  }

  if (isTableCompatible) {
    return (
      <Suspense fallback={<LoadingSkeleton type={type} />}>{children}</Suspense>
    );
  }

  return (
    <div className={className}>
      <Suspense fallback={<LoadingSkeleton type={type} />}>{children}</Suspense>
    </div>
  );
};

export default LazyLoader;
