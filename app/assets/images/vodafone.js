import * as React from "react"
import Svg, { Path, G } from "react-native-svg"

function SvgComponent(props) {
        return (
            <Svg width={34} height={34} viewBox="0 0 40 40" {...props}>
                    <Path
                        fill={props.subFill}
                        d="M18.469 3.494L11.47 9.63l.463 6.813 3.853 5.487 6.937 1.11 3.73-2.897 1.572-3.977v-3.577l-2.99-4.039.707-5.237-.657-.316-5.539-.458z"
                    />
                    <Path
                        d="M14.471 3.21c3.378-1.649 7.475-1.66 10.886-.094-2.638-.219-5.273.655-7.468 2.08-2.281 1.468-3.959 3.824-4.643 6.444-.484 1.867-.4 3.903.371 5.681 1.063 2.538 3.653 4.427 6.437 4.434 1.589.016 3.191-.51 4.416-1.533a6.931 6.931 0 002.488-4.931c.069-1.536-.308-3.146-1.296-4.356-1.073-1.338-2.707-2.085-4.34-2.481-.163-2.46 1.749-4.798 4.14-5.279 2.736 1.294 4.982 3.593 6.195 6.368a12.728 12.728 0 01.607 8.548 12.718 12.718 0 01-4.337 6.52 12.67 12.67 0 01-7.867 2.761 12.653 12.653 0 01-7.065-2.091c-2.539-1.66-4.453-4.261-5.26-7.191a12.756 12.756 0 01.432-8.13c1.16-2.934 3.459-5.388 6.304-6.75z"
                        fill={props.fill}
                    />
                    <G>
                            <Path
                                d="M22.061 31.48c.222-.379.644-.605 1.072-.656a3.01 3.01 0 011.476.181c-.041.362-.097.722-.145 1.084-.353-.135-.794-.241-1.136-.026-.264.179-.245.53-.235.811.361-.003.722-.001 1.084-.002l-.001 1.057c-.36-.001-.72.001-1.079-.002-.002 1.334-.001 2.667-.001 4.001-.432.001-.863-.001-1.295.001-.002-1.335.001-2.669-.002-4.003-.225.004-.449.003-.674.003v-1.057c.225.001.45 0 .675.002-.01-.474.001-.979.261-1.394zM14.188 30.932c.434.003.869.002 1.303.001v6.996c-.399-.001-.796-.003-1.194.002a5.763 5.763 0 01-.053-.392c-.597.671-1.704.641-2.371.092-.66-.529-.938-1.411-.934-2.233-.017-.873.343-1.807 1.101-2.291.626-.419 1.444-.439 2.147-.218l.001-1.957zm-1.319 3.062c-.373.219-.577.641-.639 1.056-.043.408-.013.833.155 1.213.126.286.364.537.67.627.413.121.877-.055 1.137-.39-.007-.838-.001-1.676-.004-2.515-.418-.16-.917-.224-1.319.009zM7.2 32.824c.644-.143 1.365-.099 1.93.268.588.363.966 1.002 1.093 1.673.14.752.027 1.565-.386 2.217a2.224 2.224 0 01-1.422 1.004c-.588.115-1.232.063-1.756-.247-.499-.283-.861-.77-1.045-1.308a3.107 3.107 0 01.148-2.437 2.247 2.247 0 011.438-1.17zm.335 1.064c-.382.125-.639.484-.737.862-.124.475-.114.996.07 1.455.121.31.371.59.702.675.36.109.779.003 1.031-.281.337-.364.42-.891.395-1.37-.019-.424-.15-.876-.487-1.158-.263-.232-.647-.278-.974-.183zM16.643 33.36a3.204 3.204 0 012.468-.554c.434.082.842.341 1.064.728.256.421.286.928.274 1.408-.001.995.001 1.99-.001 2.986-.398-.002-.796-.002-1.194 0a5.795 5.795 0 00-.051-.374c-.658.666-1.862.646-2.507-.029a1.603 1.603 0 01-.369-1.502c.116-.446.475-.789.882-.981.602-.285 1.276-.344 1.93-.395.015-.285-.054-.637-.35-.755-.588-.252-1.242.029-1.721.386-.137-.309-.285-.612-.425-.918zm1.233 2.452a.675.675 0 00-.294.774c.081.227.328.343.556.355.372.043.734-.117 1.014-.354-.003-.344-.001-.688-.002-1.032-.428.045-.883.051-1.274.257zM26.237 32.817c.631-.133 1.331-.088 1.887.266.6.361.985 1.013 1.107 1.693.15.711.026 1.475-.328 2.107-.297.537-.82.946-1.418 1.088-.639.141-1.352.08-1.908-.289-.559-.353-.916-.962-1.057-1.598a3.04 3.04 0 01.365-2.297 2.22 2.22 0 011.352-.97zm.334 1.06c-.337.101-.596.387-.716.712a2.321 2.321 0 00-.016 1.526c.083.231.21.456.411.603.381.292.975.263 1.316-.082.341-.334.442-.834.445-1.295-.015-.467-.133-.983-.517-1.288-.251-.213-.61-.251-.923-.176zM31.354 33.267a2.344 2.344 0 011.905-.476c.43.069.832.328 1.05.708.284.485.333 1.064.321 1.615v2.814c-.434.002-.869-.001-1.303.002-.002-.939-.002-1.878 0-2.817-.001-.345-.041-.723-.274-.996a.79.79 0 00-.652-.273c-.395-.015-.72.249-.998.498l.001 3.587c-.433-.002-.865-.002-1.298-.001l.001-5.056c.395.001.791.002 1.187-.001.021.131.041.263.06.396zM36.085 33.454c.801-.882 2.356-.964 3.213-.121.604.631.726 1.558.699 2.396-1.093-.005-2.185-.002-3.278-.002-.001.442.225.906.653 1.073.683.264 1.487.099 2.075-.317.102.357.237.703.335 1.061-.537.349-1.186.471-1.815.496-.668.017-1.38-.177-1.851-.675-.567-.571-.757-1.416-.698-2.197.022-.622.238-1.254.667-1.714zm1.032.573c-.235.184-.341.478-.379.764h1.942c-.038-.364-.204-.759-.559-.916-.326-.175-.73-.076-1.004.152zM0 32.873c.465 0 .929.001 1.393-.001.406 1.037.819 2.072 1.224 3.109.03.076.067.148.104.221.422-1.109.845-2.22 1.272-3.329.442-.003.884.001 1.326-.002-.688 1.684-1.374 3.367-2.058 5.053-.378.008-.755.001-1.133.004C1.414 36.245.716 34.555 0 32.873z"
                                fill={props.fill}
                            />
                    </G>
            </Svg>
        )
}

export default SvgComponent