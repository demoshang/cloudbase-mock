import { Button, HStack } from "@chakra-ui/react";
import { t } from "i18next";

import Panel from "@/components/Panel";

import useCustomSettingStore from "@/pages/customSetting";

function BottomPanel() {
  const store = useCustomSettingStore();

  return (
    <Panel className=" justify-between !flex-row">
      <HStack spacing={2}>
        <Button
          size="xs"
          variant="plain"
          onClick={() => store.togglePanel("functionPage", "DependencePanel")}
        >
          NPM{t("FunctionPanel.Dependence")}
        </Button>
        <Button
          size="xs"
          variant="plain"
          onClick={() => store.togglePanel("functionPage", "ConsolePanel")}
        >
          Console
        </Button>
      </HStack>
      <HStack spacing={2}>
        <Button
          size="xs"
          variant="plain"
          onClick={() => store.togglePanel("functionPage", "RightPanel")}
        >
          {t("FunctionPanel.InterfaceDebug")}
        </Button>
      </HStack>
    </Panel>
  );
}

export default BottomPanel;
