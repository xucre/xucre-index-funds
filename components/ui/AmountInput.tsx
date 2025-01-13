import { Box, Slider, Stack, TextField } from "@mui/material";
import { useState } from "react";

export interface AmountInputProps {
    max: number;
    decimals: number;
    quote: number;
    onChange: (value: number) => void;

}

const AmountInput: React.FC<AmountInputProps>  = ({max, decimals, quote, onChange}) => {
  const [val, setVal] = useState(0);
  const handleChange = (event, newValue) => {
    setVal(newValue); 
    onChange(newValue);
  };
  const handleTextFieldChange = (event) => {
    const value = event.target.value;
    setVal(value);
    onChange(value);
  }

  const marks = [
    {
      value: 0,
      label: "0"
    },
    {
      value: max/2,
      label: '50%'
      //label: `$${((max/2)*quote).toFixed(2)}`
    },
    {
      value: max,
      label: '100%'
      //label: `$${((max)*quote).toFixed(2)}`
    }
  ];
  const usdValue = (val * quote).toFixed(2);
  return (
    <Stack direction={'column'} spacing={2} justifyContent={'space-betweeen'} alignItems={'center'} >

      <TextField
        name="yearlyDelay"
        variant="outlined"
        id="yearlyDelay"
        value={val}
        type="number"
        helperText={`$${usdValue}`}
        onChange={handleTextFieldChange}
      />
      <Slider
        defaultValue={0}
        valueLabelDisplay="auto"
        step={max/100}
        marks={marks}
        min={0}
        max={max}
        onChange={handleChange}
      />

    </Stack>
  );
}

export default AmountInput;