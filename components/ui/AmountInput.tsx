import { Slider, TextField } from "@mui/material";
import { useState } from "react";

export interface AmountInputProps {
    max: number;
    decimals: number;
    quote: number;
    onChange: (value: number) => void;

}

const AmountInput: React.FC<AmountInputProps>  = ({}) => {
  const [val, setVal] = useState(20);
  const handleChange = (event, newValue) => {
    const sliderVal = newValue;
    const textFieldVal = event.target.value;
    setVal(newValue); 
  };
  const marks = [
    {
      value: 20,
      label: "20 +"
    },
    {
      value: 200,
      label: "200 +"
    }
  ];
  return (
    <div className="App">
      <Slider
        defaultValue={20}
        valueLabelDisplay="auto"
        step={10}
        marks={marks}
        min={20}
        max={200}
        onChange={handleChange}
      />

      <TextField
        name="yearlyDelay"
        variant="outlined"
        id="yearlyDelay"
        value={val}
      />
    </div>
  );
}

export default AmountInput;