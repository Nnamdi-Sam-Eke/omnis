import { useState } from "react";
import { FiAward} from "react-icons/fi";

export default function CreatorsCorner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger Icon */}
      <div
        className="fixed bottom-6 left-6 z-[9999] cursor-pointer text-green-400 hover:text-blue-600 transition"
        onClick={() => setOpen(true)}
      >
        <FiAward size={30} />
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-[9999] bg-black/60 backdrop-blur-sm">
          <div
            className="
              bg-white rounded-xl shadow-lg w-full max-w-xl p-6 mx-4 relative text-sm leading-relaxed
              max-h-[80vh] sm:max-h-[70vh] overflow-y-auto
            "
          >
            <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">
              Dedication
            </h2>
            <pre className="whitespace-pre-wrap text-gray-700">
{`This work is more than a product.
It is a response to a calling—
A vision whispered in the quiet place,
A fire lit by the One who formed me.

Omnis was not built by strength alone,
But by grace, revelation, and obedience.
Every line of code, every design choice,
Acknowledges the hand of the Master Builder.

May it be clear to all who use this:
That I have met with God.
Let it show in the clarity it brings,
In the wisdom it offers,
In the peace that flows through its use.

I return the glory to the One who gave the vision—
Jesus Christ, my Source, my Anchor, my King.

May Omnis serve not just needs, but purpose.
Not just progress, but destiny.
And may it always, always point back to You.`}
            </pre>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
