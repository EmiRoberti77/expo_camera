import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Button, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraHasPermission, setCameraHasPermission] = useCameraPermissions();
  const [mediaLibHasPermission, setMediaLibHasPermission] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    (async () => {
      const mediaLibPermission = await MediaLibrary.requestPermissionsAsync();
      setMediaLibHasPermission(mediaLibPermission.status === 'granted');
    })();
  }, []);

  if (!cameraHasPermission) {
    return (
      <View>
        <Text>No camera permission</Text>
      </View>
    );
  }

  if (!mediaLibHasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Permissions required for media library access
        </Text>
        <Button
          onPress={() => {
            MediaLibrary.requestPermissionsAsync().then(({ status }) =>
              setMediaLibHasPermission(status === 'granted')
            );
          }}
          title="Grant Media Permissions"
        />
      </View>
    );
  }

  if (!cameraHasPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission required</Text>
        <Button onPress={setCameraHasPermission} title="grant permission" />
      </View>
    );
  }

  const takePic = async () => {
    if (!cameraRef.current) {
      console.log('cameraRef null');
      return;
    }
    try {
      const photo = await cameraRef.current.takePictureAsync();
      console.log('photo taken', photo?.uri);
      if (!photo) {
        console.error('Error:can not save image');
        return;
      }
      const asset = await MediaLibrary.createAssetAsync(photo!.uri);
      console.log('Success', asset);
    } catch (err: any) {
      console.error(err);
    }
  };

  const toggleCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCamera}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePic}>
            <Text style={styles.text}>Take Picture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
