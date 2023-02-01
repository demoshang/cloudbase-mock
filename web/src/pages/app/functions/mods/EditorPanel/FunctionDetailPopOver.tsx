import { BiMessageSquareDetail } from "react-icons/bi";
import { Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal } from "@chakra-ui/react";

import FileTypeIcon from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import { formatDate } from "@/utils/format";

import useFunctionStore from "../../store";

const FunctionDetailPopOver = () => {
  const { currentFunction } = useFunctionStore();
  return (
    <Popover trigger="hover" placement="bottom-start" isLazy>
      <IconWrap>
        <PopoverTrigger>
          <span>
            <BiMessageSquareDetail />
          </span>
        </PopoverTrigger>
      </IconWrap>
      <Portal>
        <PopoverContent width={"400px"}>
          <PopoverBody px="6" py="4">
            <h2 className="text-2xl mb-1">
              <span className="align-middle">{currentFunction.name}</span>{" "}
              <FileTypeIcon type="ts" />
            </h2>
            <div className="text-second">
              <span>更新于 {formatDate(currentFunction.updatedAt)}</span>
              <p className="mt-2">{currentFunction.desc}</p>
            </div>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default FunctionDetailPopOver;
