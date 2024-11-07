import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import ProfilIcon from "@components/UI/iconsComponents/icons/profilIcon";
import theme from "@styles/theme";
import { StarknetIdJsContext } from "@context/StarknetIdJsProvider";
import { useStarkProfile } from "@hooks/useStarkProfile"; // Ensure this hook is correctly imported
import { StarkProfile } from "starknetid.js";

type AvatarProps = {
  address: string;
  width?: string;
};

const Avatar: FunctionComponent<AvatarProps> = ({ address, width = "32" }) => {
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);

  const { data: profileData } = useStarkProfile({ address }); // Fetching profile data using the hook

  const [profile, setProfile] = useState<StarkProfile | null>(null);

  useEffect(() => {
    if (!starknetIdNavigator) return;
    starknetIdNavigator.getProfileData(address).then((profile) => {
      setProfile(profile);
    });
  }, [starknetIdNavigator, address]);
  return (
    <>
      {profile?.profilePicture ? (
        <img
          src={profile?.profilePicture}
          width={width}
          height={width}
          className="rounded-full"
          alt="User Avatar" 
        />
      ) : (
        <ProfilIcon width={width} color={theme.palette.secondary.main} />
      )}
    </>
  );
};

export default Avatar;
