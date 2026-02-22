"use client";
interface DeletePickProps {
  name: string;
  division: number;
  week: number;
  onSubmit: (name: string, division: number, week: number) => void;
}

export function DeletePickComponent({
  name,
  division,
  week,
  onSubmit,
}: DeletePickProps) {
  return (
    <div>
      <p>You have already made a pick. Would you like to delete it?</p>
      <button
        onClick={() => onSubmit(name, division, week)}
        className="... disabled:cursor-not-allowed disabled:opacity-50"
      >
        Yes
      </button>
    </div>
  );
}
