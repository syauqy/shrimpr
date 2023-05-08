import React, { useState, useEffect, useRef, useMemo, Fragment } from "react";
import { PageLayout } from "@/components/layouts/page";
import { PageContent } from "@/components/layouts/page-content";
import Container from "@/components/layouts/container";
import dynamic from "next/dynamic";
import { Dialog, Transition } from "@headlessui/react";
import Countdown from "react-countdown";
// import TinderCard from "react-tinder-card";
import axios from "axios";
import Image from "next/image";
import clsx from "clsx";
import toast, { Toaster } from "react-hot-toast";
// import TinderCard from "react-tinder-card";

const TinderCard = dynamic(() => import("react-tinder-card"), {
  ssr: false,
});

export default function Quiz() {
  const [employees, setEmployees] = useState([]);
  const [correctScore, setCorrectScore] = useState(0);
  const [incorrectScore, setIncorrectScore] = useState(0);
  const [timer, setTimer] = useState(Date.now() + 60000);
  const [names, setNames] = useState([]);
  const [unknowns, setUnknowns] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  // const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState();
  const [isOpenQuestion, setIsOpenQuestion] = useState(false);
  const [isOpenResult, setIsOpenResult] = useState(false);

  const timerRef = useRef();

  // const currentIndexRef = useRef(currentIndex);

  function swiped(direction, swipedUser, index) {
    if (direction === "right") {
      setIsOpenQuestion(true);

      setEmployee(swipedUser);
      if (employee) {
        getQuestions(swipedUser);
      }
    } else {
      const incorrect = incorrectScore;
      const e = swipedUser;
      if (unknowns.length > 0) {
        setUnknowns([...unknowns, e]);
      } else {
        setUnknowns([e]);
      }
      console.log("ga kenal");
      setIncorrectScore(incorrect + 1);
      toast.error("Coba kenalan dulu deh 😉");
    }
    setLastDirection(direction);
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const restartQuiz = () => {
    setEmployees([]);
    getEmployees();
    setCorrectScore(0);
    setIncorrectScore(0);
    setUnknowns(0);
    // console.log(timerRef);
    setIsOpenResult(false);
    if (employees.length > 0) {
      setTimer(Date.now() + 60000);
      timerRef.current.start();
    }
    // setQuizStarted(true);
  };

  // const karyawan = useMemo(() => getEmployee(), []);

  async function getEmployees() {
    const employees = await axios
      .get(
        `${process.env.NEXT_PUBLIC_AIRTABLE_URI}/employee?filterByFormula=NOT%28%7Bimage%7D%20%3D%20%27%27%29`,
        {
          headers: {
            Authorization: `Bearer ` + process.env.NEXT_PUBLIC_AIRTABLE_TOKEN,
          },
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => console.log(error.data));
    setEmployees(shuffle(employees.records));
  }

  async function getNames(employee) {
    const names = await axios
      .get(
        `${process.env.NEXT_PUBLIC_AIRTABLE_URI}/employee?fields%5B%5D=name&filterByFormula=AND(%7Bgender%7D%3D%22${employee.fields.gender}%22%2C%7Bname%7D!%3D%22${employee.fields.name}%22)`,
        {
          headers: {
            Authorization: `Bearer ` + process.env.NEXT_PUBLIC_AIRTABLE_TOKEN,
          },
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => console.log(error.data));
    return shuffle(names.records).slice(0, 3);
  }

  async function getQuestions(employee) {
    // console.log(employee);
    const names = await getNames(employee);
    if (names.length > 2) {
      names.push(employee);
      setNames(shuffle(names));
    }
  }

  function getAnswer(answer) {
    // console.log(employee);
    // console.log("e", answer, employee);
    if (answer === employee.id) {
      console.log("kenal");
      const correct = correctScore;
      setCorrectScore(correct + 1);
      toast.success("Kamu benar 👍");
      setNames([]);
      setIsOpenQuestion(false);
    } else {
      const incorrect = incorrectScore;
      const e = employee;
      if (unknowns.length > 0) {
        setUnknowns([...unknowns, e]);
      } else {
        setUnknowns([e]);
      }
      console.log("ga kenal");
      setIncorrectScore(incorrect + 1);
      toast.error("Coba kenalan dulu deh 😉");
      setNames([]);
      setIsOpenQuestion(false);
    }
  }

  const handleTimerComplete = () => {
    console.log("Countdown is completed in the Home component");
    setIsOpenResult(true);
    // Perform your action here when the countdown is completed
  };

  useEffect(() => {
    if (employee.length > 0) {
    } else {
      getEmployees();
    }
    // getQuestions(employee);
    // getNames();
  }, []);

  console.log(unknowns);

  return (
    <PageLayout>
      <PageContent>
        <Container className="px-4 justify-center text-center w-screen h-screen max-h-screen overflow-hidden">
          <div className="header text-slate-600 py-2 space-y-2">
            <div className="text-4xl font-extrabold text-transparent bg-gradient-to-r bg-clip-text from-blue-500 to-sky-500 tracking-tight">
              Shrimpr
            </div>
            <div className="grid grid-cols-3">
              <div>
                <div className="font-semibold">Ga Kenal</div>
                <div>{incorrectScore}</div>{" "}
              </div>
              <div>
                <Countdown
                  date={timer}
                  renderer={(props) => (
                    <CountdownRenderer
                      {...props}
                      onComplete={handleTimerComplete}
                    />
                  )}
                  ref={timerRef}
                  precision={2}
                />
              </div>
              <div>
                <div className="font-semibold">Kenal</div>
                <div>{correctScore}</div>
              </div>
            </div>
          </div>
          <div className="cards max-w-md  mx-auto relative w-full h-[73%] flex justify-center">
            {employees.length ? (
              employees.map((e, i) => (
                <TinderCard
                  key={e.id}
                  className="swipe p-2 absolute inset-0"
                  onSwipe={(dir) => swiped(dir, e, i)}
                  preventSwipe={["up", "down"]}
                  swipeRequirementType="position"
                >
                  <Image
                    className="object-cover rounded-xl card relative object-bottom"
                    src={e.fields.image[0].url}
                    alt={e.fields.name}
                    fill={true}
                    priority
                  />
                </TinderCard>
              ))
            ) : (
              <div className="flex flex-col w-full space-y-4 animate-pulse">
                <div className="bg-gray-400 h-full w-full rounded-md"></div>
              </div>
            )}
          </div>
          <div className="flex justify-between"></div>
        </Container>

        <Toaster position="bottom-center" />
        <Transition appear show={isOpenQuestion} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => {}}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-white bg-opacity-90" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all space-y-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg text-center font-bold leading-6 text-gray-900"
                    >
                      Siapakah Aku?
                    </Dialog.Title>
                    <div className="flex h-[180px] w-full overflow-hidden justify-center items-center rounded-xl">
                      {employee?.fields?.image[0] ? (
                        <Image
                          className="rounded-xl object-bottom"
                          src={employee.fields.image[0].url}
                          alt={employee.fields.name}
                          height={400}
                          width={180}
                        />
                      ) : (
                        <div className="flex flex-col w-full h-full space-y-4 animate-pulse">
                          <div className="bg-gray-400 h-full w-full rounded-md"></div>
                        </div>
                      )}
                    </div>

                    <div className="w-full flex flex-col space-y-2">
                      {names.length ? (
                        names.map((name, i) => (
                          <button
                            key={i}
                            type="button"
                            value={name.id}
                            className="flex flex-1 justify-center rounded-full border px-4 py-3 text-sm font-medium text-jala-insight border-jala-insight hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            onClick={() => getAnswer(name.id)}
                          >
                            {name.fields.name}
                          </button>
                        ))
                      ) : (
                        <div className="space-y-4 animate-pulse">
                          <div className="bg-gray-400 h-8 rounded-md"></div>
                          <div className="bg-gray-400 h-8 rounded-md"></div>
                          <div className="bg-gray-400 h-8 rounded-md"></div>
                          <div className="bg-gray-400 h-8 rounded-md"></div>
                        </div>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <Transition appear show={isOpenResult} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => {}}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-white bg-opacity-90" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl text-slate-600 bg-white p-6 text-left align-middle shadow-xl transition-all space-y-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg text-center font-bold leading-6 text-gray-900"
                    >
                      Waktu Habis
                    </Dialog.Title>
                    <div className="grid grid-cols-2 text-center">
                      <div>
                        <div className="font-semibold">Ga Kenal</div>
                        <div>{incorrectScore}</div>{" "}
                      </div>
                      <div>
                        <div className="font-semibold">Kenal</div>
                        <div>{correctScore}</div>
                      </div>
                    </div>
                    <div className="w-full flex flex-col space-y-2">
                      <button
                        type="button"
                        className="flex flex-1 justify-center rounded-full border px-4 py-3 text-sm font-medium text-jala-insight border-jala-insight hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={restartQuiz}
                      >
                        Mulai Lagi
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </PageContent>
    </PageLayout>
  );
}

const CountdownRenderer = ({ seconds, completed, onComplete }) => {
  useEffect(() => {
    if (completed) {
      // Call the callback function when the countdown is completed
      onComplete();
    }
  }, [completed, onComplete]);
  if (completed) {
    return <div className="text-xl text-jala-trade font-bold">Time is up!</div>;
  } else {
    return (
      <div
        className={clsx(
          seconds <= 10 ? "text-red-500" : "text-blue-500",
          "text-3xl font-bold"
        )}
      >
        {seconds}
      </div>
    );
  }
};
