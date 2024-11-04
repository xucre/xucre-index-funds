import { Box, Button, Stack, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";

const round = (num) => Math.round(num * 10) / 10;

const NumberInput = ({min, max, step, value, onChange} : {min: number, max: number, step: number, value: number, onChange: Function}) => {
  const {language} = useLanguage();
  const [count, setCount] = useState(value);
  const IncNum = () => {
    if (count <= max) {
      setCount(round(count + step));
    }
    
  };
  const DecNum = () => {
    if (count > min) setCount(round(count - step));
    else {
      setCount(0);
    }
  };

  useEffect(() => {
    onChange(null, count);
  }, [count]);

  useEffect(() => {
    setCount(value);
  }, [value]);

  return (
    <>
      <Stack className="main_div" direction={'column'} alignItems={'flex-start'} justifyContent={'center'}>
        <Stack className="center_div" direction={'column'} alignItems={'center'} justifyContent={'center'}>
          <h1>{count}%</h1>
          <div className="btn_div">
            <Tooltip title="Add">
              <Button onClick={IncNum}>
                <AddIcon />
              </Button>
            </Tooltip>

            <Button onClick={DecNum}>
              <RemoveIcon />
            </Button>
          </div>
        </Stack>
      </Stack>
    </>
  );
};

export default NumberInput;