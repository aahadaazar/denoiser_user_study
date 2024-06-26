import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../Components/Header";
import styles from "../Components/FilterCentering.module.css";
import CommonService from "../Services/Common/CommonService";
import Play from "../Assests/Images/play.svg";
import Pause from "../Assests/Images/pause.svg";
import Reload from "../Assests/Images/reload.svg";

const HAcalib = () => {
  const URL = process.env.REACT_APP_BE_URL;
  const currentuserId = useSelector((state) => state.CommonReducer.userId);
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayAudio, setReplayAudio] = useState(false);
  const navigate = useNavigate();
  const [stepSize, setStepSize] = useState("2");
  const [inputLevelsL, setInputLevelsL] = useState([]);
  const [userIds, setUserIds] = useState([]); // List of user IDs
  const [userId, setUserId] = useState(""); // Selected user ID
  const [inputLevelsR, setInputLevelsR] = useState([]);
  const [lginputValues, setlginputValues] = useState([]);
  const [rginputValues, setrginputValues] = useState([]);
  const [gainvaluesString, setgainvaluesString] = useState([]);
  const [logString, setlogString] = useState([]);
  const freq_labels = [
    "200",
    "500",
    "1000",
    "2000",
    "3000",
    "4000",
    "6000",
    "8000",
  ];
  const [oldfiltersA, setOldfiltersA] = useState([]);
  const [oldfiltersB, setOldfiltersB] = useState([]);
  const [oldfiltersC, setOldfiltersC] = useState([]);
  const [filterIdA, setFilterIdA] = useState("");
  const [filterIdB, setFilterIdB] = useState("");
  const [filterIdC, setFilterIdC] = useState("");
  const [filterAgtable, setFilterAgtable] = useState("");
  const [filterBgtable, setFilterBgtable] = useState("");
  const [filterCgtable, setFilterCgtable] = useState("");
  useEffect(() => {
    fetchfilter("A");
    fetchfilter("B");
    fetchfilter("C");
    fetchUserIds();
  }, []);

  // Function to fetch user IDs from the server
  const fetchUserIds = async () => {
    try {
      const response = await CommonService.GetAllUsers();
      if (response.success) {
        const data = response.data;
        const ids = Object.values(data).map((user) => user.Id);
        setUserIds(ids);
      } else {
        console.error("Failed to fetch user IDs");
        // setgainvaluesString("Failed to fetch user IDs")
      }
    } catch (error) {
      console.error("Error fetching user IDs:", error);
      setgainvaluesString(error.message);
    }
  };
  const fetchfilter = async (filterType) => {
    try {
      let response;
      if (filterType == "A") {
        response = await CommonService.GetFilterA();
        //toast.success("Filter A Found");
      } else if (filterType == "B") {
        response = await CommonService.GetFilterB();
        //toast.success("Filter B Found");
      } else if (filterType == "C") {
        response = await CommonService.GetFilterC();
        //toast.success("Filter C Found");
      } else {
        toast.error("Filter not identified");
        response = await CommonService.GetFilterA();
      }

      if (response.success) {
        const data = response.data;
        const userIDsAndDates = data.map((entry) => ({
          sno: entry.sno,
          userId: entry.UserId,
          date: entry.date,
        }));

        if (filterType == "A") {
          setOldfiltersA(userIDsAndDates);
          setVolume(data.volume);
        } else if (filterType == "B") {
          setOldfiltersB(userIDsAndDates);
        } else if (filterType == "C") {
          setOldfiltersC(userIDsAndDates);
        } else {
          toast.error("Filter not identified");
          response = await CommonService.GetFilterA();
        }
      } else {
        console.error("Failed to fetch filters");
        // setgainvaluesString("Failed to fetch user IDs")
      }
    } catch (error) {
      console.error("Error fetching user filters:", error);
    }
  };

  useEffect(() => {
    const size = parseInt(stepSize, 10);
    if (!isNaN(size) && size > 0) {
      setInputLevelsL(new Array(size).fill("1"));
      setInputLevelsR(new Array(size).fill("1"));
    } else {
      setInputLevelsL([]); // Ensure no invalid array length
      setInputLevelsR([]);
    }
  }, [stepSize]);

  const handleInputLevelChangeL = (index, value) => {
    const newInputLevelsL = [...inputLevelsL];
    newInputLevelsL[index] = value;
    setInputLevelsL(newInputLevelsL);
  };
  const handleInputLevelChangeR = (index, value) => {
    const newInputLevelsR = [...inputLevelsR];
    newInputLevelsR[index] = value;
    setInputLevelsR(newInputLevelsR);
  };

  const handlelgainChange = (index, value) => {
    const newlgainValues = [...lginputValues];
    newlgainValues[index] = value;
    setlginputValues(newlgainValues);
  };
  const handlergainChange = (index, value) => {
    const newrgainValues = [...rginputValues];
    newrgainValues[index] = value;
    setrginputValues(newrgainValues);
  };

  const handleSubmit = async (e) => {
    //console.log('Attempting to submit form');
    e.preventDefault(); // Prevent default form submission behavior
    // Check which button was clicked
    const multiplyAndConcatenate = (inputLevels, gainValues) => {
      let results = [];
      let resultsstring = "";

      gainValues.forEach((gainValue) => {
        resultsstring = resultsstring + "[";
        const numericGainValue = parseFloat(gainValue);
        inputLevels.forEach((level) => {
          const numericLevel = parseFloat(level);
          resultsstring =
            resultsstring + (numericLevel * numericGainValue).toString();
          resultsstring = resultsstring + " ";
          results.push(numericLevel * numericGainValue);
        });
        resultsstring = resultsstring.slice(0, -1) + "];";
      });
      return [results, resultsstring];
    };

    const action = e.nativeEvent.submitter.name;
    const gainvaluesStringL = lginputValues.join(",");
    const gainvaluesStringR = rginputValues.join(",");
    // You can do different things depending on the action
    const [multipliedValuesL, multipliedStringL] = multiplyAndConcatenate(
      inputLevelsL,
      lginputValues
    );
    const [multipliedValuesR, multipliedStringR] = multiplyAndConcatenate(
      inputLevelsR,
      rginputValues
    );
    const mhagainparam =
      "[" + multipliedStringR + multipliedStringL.slice(0, -1) + "]"; // Corrected variable name
    setgainvaluesString(
      "[" + multipliedStringR + multipliedStringL.slice(0, -1) + "]"
    );

    if (action === "applyPlay") {
      // Logic for Apply & Play
      try {
        //const mhagainparam = '['+multipliedStringR+multipliedStringL.slice(0, -1)+']'
        var payload = {
          mhagainparam: mhagainparam,
          filterAparam: filterAgtable,
          filterBparam: filterBgtable,
          filterCparam: filterCgtable,
        };
        const response = await CommonService.RunUserGaintest(payload);
        toast.success(response.message);
      } catch (error) {
        console.error("Error:", error);
        toast.success(error.message);
      }
    } else if (action === "save") {
      // Logic for Save
      var payload = {
        UserId: currentuserId,
        ParticipantID: userId,
        Step: stepSize,
        RHz200: rginputValues[0],
        RHz500: rginputValues[1],
        RHz1000: rginputValues[2],
        RHz2000: rginputValues[3],
        RHz3000: rginputValues[4],
        RHz4000: rginputValues[5],
        RHz6000: rginputValues[6],
        RHz8000: rginputValues[7],
        LHz200: lginputValues[0],
        LHz500: lginputValues[1],
        LHz1000: lginputValues[2],
        LHz2000: lginputValues[3],
        LHz3000: lginputValues[4],
        LHz4000: lginputValues[5],
        LHz6000: lginputValues[6],
        LHz8000: lginputValues[7],
        Volume: volume,
        Gaintable: mhagainparam,
      };
      var response = await CommonService.AddUserGain(payload);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
      setgainvaluesString(gainvaluesString + "\n" + response.message);
    }
  };

  const handlePlayPauseAudio = () => {
    const audioElement = audioRef.current;
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause(); // Pause audio playback
        toast.success("Audio Paused");
      } else {
        audioElement.volume = parseFloat(volume, 10);
        audioElement.play(); // Start audio playback
        toast.success("Audio Playing");
      }
      setIsPlaying(!isPlaying); // Toggle the play state
    }
  };
  const handleReplayAudio = () => {
    const audioElement = audioRef.current;
    if (audioElement) {
      // Pause the audio if it's currently playing
      if (isPlaying) {
        audioElement.pause();
      }

      // Set the audio source URL with a unique query parameter
      const audioSourceUrl = `${URL}/assets/test_sentence/userGain-test/Combined_0_stereo_ISTS.wav`;
      const uniqueUrl = audioSourceUrl + "?t=" + Date.now(); // Append current timestamp as query parameter
      audioElement.src = uniqueUrl;

      // Load and play the audio
      audioElement.load();
      audioElement.volume = parseFloat(volume, 10);
      audioElement.play();

      // Set the audio playback time to the beginning
      audioElement.currentTime = 0;
      audioElement
        .play()
        .then(() => {
          setIsPlaying(true); // Update isPlaying state
          toast.success("Audio Reloaded");
        })
        .catch((error) => {
          toast.error("Error playing audio:" + error.message);
        });
    }
  };

  useEffect(() => {
    // When replayAudio becomes true, reset it to false and play the audio
    if (replayAudio) {
      handleReplayAudio(); // Call the replay function directly
      setReplayAudio(false); // Reset replayAudio
    }
  }, [replayAudio]);

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.volume = parseFloat(e.target.value);
      toast.success("Volume changed to:" + e.target.value);
    }
  };

  const handleUsergainSelection = async (e) => {
    const newParticipantId = e.target.value;
    setUserId(newParticipantId);
    const response = await CommonService.GetUserGainById(newParticipantId);

    if (response.success) {
      const data = response.data;
      setStepSize(data.step);
      setrginputValues([
        data.R200hz,
        data.R500hz,
        data.R1000hz,
        data.R2000hz,
        data.R3000hz,
        data.R4000hz,
        data.R6000hz,
        data.R8000hz,
      ]);
      setlginputValues([
        data.L200hz,
        data.L500hz,
        data.L1000hz,
        data.L2000hz,
        data.L3000hz,
        data.R4000hz,
        data.L6000hz,
        data.L8000hz,
      ]);
      setVolume(data.volume);
      toast.success(response.message);
    } else {
      setStepSize(2);
      setrginputValues([0, 0, 0, 0, 0, 0, 0, 0]);
      setlginputValues([0, 0, 0, 0, 0, 0, 0, 0]);
      //setVolume(0.5)
      toast.error(response.message);
    }
  };

  const handleFilterSelection = async (e, filterType) => {
    const newFilterId = e.target.value;
    setFilterIdA(newFilterId);
    let response;
    if (filterType == "A") {
      response = await CommonService.GetFilterAById(newFilterId);
      setFilterAgtable(response.data.gtable);
      setVolume(response.data.volume);
    } else if (filterType == "B") {
      response = await CommonService.GetFilterBById(newFilterId);
      setFilterBgtable(response.data.gtable);
    } else if (filterType == "C") {
      response = await CommonService.GetFilterCById(newFilterId);
      setFilterCgtable(response.data.gtable);
    } else {
      toast.error("Filter not identified");
    }

    const data = response.data;
    toast.success(data.gtable);
  };

  return (
    <>
      <Header showBackBtn={true} />

      <div className={styles.centeringContainer}>
        <form onSubmit={handleSubmit} className={styles.formLayout}>
          <h2 class={styles.smallheading}>HEARING AID CONFIGURATION</h2>
          <div className={styles.inlineGroup}>
            <label htmlFor="userId">Load Filter A:</label>
            <select
              id="filterIdA"
              value={filterIdA}
              onChange={(e) => handleFilterSelection(e, "A")}
            >
              <option value="">Load Filter A</option>
              {oldfiltersA.map(({ sno, userId, date }) => (
                <option key={sno} value={sno}>
                  {`${sno} - ${userId} - ${date}`}
                </option>
              ))}
            </select>
          </div>
          <p>Selected Filter A gain table: {filterAgtable}</p>
          <div className={styles.inlineGroup}>
            <label htmlFor="userId">Load Filter B:</label>
            <select
              id="filterIdB"
              value={filterIdB}
              onChange={(e) => handleFilterSelection(e, "B")}
            >
              <option value="">Load Filter B</option>
              {oldfiltersB.map(({ sno, userId, date }) => (
                <option key={sno} value={sno}>
                  {`${sno} - ${userId} - ${date}`}
                </option>
              ))}
            </select>
          </div>
          <p>Selected Filter B gain table: {filterBgtable}</p>
          <div className={styles.inlineGroup}>
            <label htmlFor="userId">Load Filter C:</label>
            <select
              id="filterIdC"
              value={filterIdC}
              onChange={(e) => handleFilterSelection(e, "C")}
            >
              <option value="">Load Filter C</option>
              {oldfiltersC.map(({ sno, userId, date }) => (
                <option key={sno} value={sno}>
                  {`${sno} - ${userId} - ${date}`}
                </option>
              ))}
            </select>
          </div>
          <p>Selected Filter C gain table: {filterCgtable}</p>
          <div className={styles.inlineGroup}>
            <label htmlFor="userId">Select User:</label>
            <select
              id="userId"
              value={userId}
              onChange={handleUsergainSelection}
            >
              <option value="">Select User ID</option>
              {userIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          {userId && (
            <>
              <div className={styles.inlineGroup}>
                <button
                  onClick={handlePlayPauseAudio}
                  className={`button btn btn-lg btn-primary play mb-3 ${styles.playButton}`}
                  style={{ width: "70px", height: "50px" }}
                >
                  <img
                    src={isPlaying ? Pause : Play} // Toggle icon based on isPlaying state
                    alt={isPlaying ? "Pause" : "Play"} // Toggle alt text based on isPlaying state
                    loading="lazy"
                    style={{ width: "100%", height: "100%" }}
                  />
                </button>
                <button
                  onClick={handleReplayAudio}
                  className={`button btn btn-lg btn-primary play mb-3 ${styles.playButton}`}
                  style={{ width: "70px", height: "50px" }}
                >
                  <img
                    src={Reload}
                    loading="lazy"
                    style={{ width: "100%", height: "100%" }}
                  />
                </button>

                <audio ref={audioRef}>
                  <source
                    src={`${URL}/assets/test_sentence/userGain-test/Combined_0_stereo_ISTS.wav`}
                    type="audio/wav"
                  />
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className={styles.inlineGroup}>
                <label htmlFor="volume">Volume:</label>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                />
              </div>

              <div className={styles.inlineGroup}>
                <label htmlFor="stepSize">Input Level (dB):</label>
                <input
                  id="stepSize"
                  type="number"
                  value={stepSize}
                  onChange={(e) => setStepSize(e.target.value)}
                  min="1"
                />
              </div>

              <h3>Right Channel Gain</h3>
              <div className={styles.inlineGroup}>
                {freq_labels.map((label, index) => (
                  <div key={index}>
                    <label htmlFor={`input-${index}`}>{`${label} Hz`}</label>
                    <input
                      id={`input-${index}`}
                      type="text"
                      value={rginputValues[index]}
                      onChange={(e) => handlergainChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.inlineGroup}>
                {inputLevelsR.map((level, index) => (
                  <div key={index}>
                    <label htmlFor={`inputLevel-${index}`}>
                      {index * (120 / (stepSize - 1))} dB:
                    </label>
                    <input
                      id={`inputLevel-${index}`}
                      type="text"
                      value={level}
                      onChange={(e) =>
                        handleInputLevelChangeR(index, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              <h3>Left Channel Gain</h3>
              <div className={styles.inlineGroup}>
                {freq_labels.map((label, index) => (
                  <div key={index}>
                    <label htmlFor={`input-${index}`}>{`${label} Hz`}</label>
                    <input
                      id={`input-${index}`}
                      type="text"
                      value={lginputValues[index]}
                      onChange={(e) => handlelgainChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.inlineGroup}>
                {inputLevelsL.map((level, index) => (
                  <div key={index}>
                    <label htmlFor={`inputLevel-${index}`}>
                      {index * (120 / (stepSize - 1))} dB:
                    </label>
                    <input
                      id={`inputLevel-${index}`}
                      type="text"
                      value={level}
                      onChange={(e) =>
                        handleInputLevelChangeL(index, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                name="applyPlay"
                className={`button btn btn-lg btn-secondary play mb-3 ${styles.playButton}`}
                style={{ width: "100px", height: "50px" }}
              >
                Apply
              </button>
              <button
                type="submit"
                name="save"
                className={`button btn btn-lg btn-success play mb-3 ${styles.playButton}`}
                style={{ width: "80px", height: "50px" }}
              >
                Save
              </button>
            </>
          )}
        </form>
      </div>
    </>
  );
};

export default HAcalib;
