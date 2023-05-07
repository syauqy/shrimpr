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
// import TinderCard from "react-tinder-card";

const TinderCard = dynamic(() => import("react-tinder-card"), {
  ssr: false,
});

export default function Card() {
  const [employees, setEmployees] = useState([]);
  const [correctScore, setCorrectScore] = useState(0);
  const [incorrectScore, setIncorrectScore] = useState(0);
  const [timer, setTimer] = useState(Date.now());
  const [names, setNames] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState();
  const [isOpen, setIsOpen] = useState(false);

  const timerRef = useRef();

  const currentIndexRef = useRef(currentIndex);

  const swiped = async (direction, swipedUser, index) => {
    if (direction === "right") {
      setIsOpen(true);

      setEmployee(swipedUser);
      if (employee) {
        getQuestions(swipedUser);
      }
    } else {
      const incorrect = incorrectScore;
      console.log("ga kenal");
      setIncorrectScore(incorrect + 1);
    }
    setLastDirection(direction);
    // updateCurrentIndex(index - 1);
  };

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const outOfFrame = (name, idx) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    // handle the case in which go back is pressed before card goes outOfFrame
    // currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
    // TODO: when quickly swipe and restore multiple times the same card,
    // it happens multiple outOfFrame events are queued and the card disappear
    // during latest swipes. Only the last outOfFrame event should be considered valid
  };

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // const karyawan = useMemo(() => getEmployee(), []);

  async function getEmployee() {
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
    // shuffle(employees.records);
    // return employees.records;
    setEmployees(shuffle(employees.records));
  }

  async function getNames(employee) {
    // console.log("e", employee, employee.fields.gender);
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
    // console.log("e", answer, employee);
    if (answer === employee.id) {
      console.log("kenal");
      const correct = correctScore;
      setCorrectScore(correct + 1);
      setNames([]);
      closeModal();
    } else {
      const incorrect = incorrectScore;
      console.log("ga kenal");
      setIncorrectScore(incorrect + 1);
      setNames([]);
      closeModal();
    }
  }

  const handleTimerComplete = () => {
    console.log("Countdown is completed in the Home component");
    // Perform your action here when the countdown is completed
  };

  useEffect(() => {
    getEmployee();
    // getQuestions(employee);
    // getNames();
    if (timerRef.current.isCompleted() == true) {
      console.log("beres");
    }
    // console.log(timerRef.current.isCompleted());
  }, []);

  // console.log(karyawan);

  return (
    <PageLayout>
      <PageContent>
        <Container className="px-4 justify-center text-center w-screen h-screen max-h-screen overflow-hidden">
          <div className="header text-slate-600 py-4 space-y-2">
            <div className="text-xl font-bold">Shrimpr</div>
            <div className="grid grid-cols-3">
              <div>
                <div className="font-semibold">Ga Kenal</div>
                <div>{incorrectScore}</div>{" "}
              </div>
              <div>
                <Countdown
                  date={timer + 60000}
                  renderer={(props) => (
                    <CountdownRenderer
                      {...props}
                      onComplete={handleTimerComplete}
                    />
                  )}
                  precision={2}
                  ref={timerRef}
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
        <Transition appear show={isOpen} as={Fragment}>
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
      <div className="text-3xl text-jala-insight font-semibold">{seconds}</div>
    );
  }
};
