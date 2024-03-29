import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { StyleSheet, ImageBackground, View, Image, TextInput } from 'react-native';
import Button from './button';
import AlertModal from './alertModal';

const ImageResult = (props) => {
  const [onVisible, setonVisible] = useState(false); // modal state
  const [saveMessage, setSaveMessage] = useState(''); // modal message state
  const { photo_id, picture_id } = props.galleryData;

  // 갤러리에 들어가야할 데이터 state
  const [data, setData] = useState(
    {
      photo_id: '',
      picture_id: '',
      comment: '',
    }
  );

  // 네트워크 연결 확인
  useEffect(() => {
    setData({ ...data, photo_id: photo_id, picture_id: picture_id });
    props.unsubscribe;
  }, [props.galleryData]);

  // comment 입력 이벤트
  const getComment = (event) => {
    const { eventCount, target, text } = event.nativeEvent;
    setData({ ...data, photo_id: photo_id, picture_id: picture_id, comment: text });
    console.log(data);
  };

  // 이미지 전시 이벤트
  const handleClickGallery = () => {
    axios.post(`${props.url}/gallery`, data)
      .then((response) => {
        props.getLoadData(response.data.result);
        props.navigation.navigate('Gallery');
      })
      .catch((error) => console.log(error))
  };

  // 갤러리 저장 이벤트
  const saveFile = async (fileUri) => {
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    await MediaLibrary.createAlbumAsync('flooming', asset, false);
  };

  // 사진 저장
  const saveImage = async () => {
    const downloadResumable = FileSystem.createDownloadResumable(
      `${props.url}/picture/${picture_id}`,
      FileSystem.documentDirectory + '.jpg',
      {}
    );

    try {
      const { uri } = await downloadResumable.downloadAsync().then((item) => {
        return item;
      });

      saveFile(uri)
        .then(() => {
          setonVisible(true);
          setSaveMessage('저장되었어요 :)');
        });
    } catch (event) {
      setonVisible(true);
      setSaveMessage('사진을 저장할 수 없어요');
    };
  };

  // 뒤로가기 이벤트
  const handleGoBack = () => { setonVisible(false) };

  if (!props.unsubscribe) {
    return <Error navigation={props.navigation} message={'Network Error'} />
  } else {
    return (
      <ImageBackground
        source={require('../assets/images/mainBackground.jpg')}
        style={styles.backgroundImage}
        imageStyle={{ borderTopLeftRadius: 40, borderTopRightRadius: 40, opacity: 0.9 }}>
        {/* 알림창 (modal) */}
        <AlertModal
          onVisible={onVisible}
          handleGoBack={handleGoBack}
          message={saveMessage}
          comment={'닫기'}
        />

        {/* 그림 결과 */}
        <View style={styles.illustContainer}>
          <View style={styles.imageSize}>
            <Image style={styles.illust} source={{ uri: `${props.url}/picture/${props.galleryData.picture_id}` }} />
          </View>
          <TextInput
            style={styles.illustText}
            placeholder='남기고 싶은 말이 있나요?'
            maxLength={100}
            placeholderTextColor='#FCFCFC'
            onChange={getComment}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button text={'전시관에 업로드 할게요'} onPress={handleClickGallery} />
          <Button text={'저장 할게요'} onPress={saveImage} />
        </View>
      </ImageBackground>
    )
  }
};

export default ImageResult;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#140855',
  },
  illustContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSize: {
    width: '90%',
    height: 300,
    marginBottom: 15,
    borderRadius: 20,
  },
  illust: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  illustText: {
    color: '#FCFCFC',
    fontSize: 15,
    fontFamily: 'symkyungha',
    width: '80%',
  },
  buttonContainer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  }
})