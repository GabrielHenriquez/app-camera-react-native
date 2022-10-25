import React, {useState} from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, Modal, Image, PermissionsAndroid, Platform } from 'react-native';
import {RNCamera} from 'react-native-camera'
import CameraRoll from '@react-native-community/cameraroll';
import * as ImagePicker from "react-native-image-picker"

export default function App() {

//States
 const [type, setType] = useState(RNCamera.Constants.Type.back)
 const [open, setOpen] = useState(false)
 const [capturePhoto, setCapturePhoto] = useState(null)

//Functions
 async function takePicture(camera){
  setOpen(true)
  const options = {quality: 0.5, base64: true}
  const data = await camera.takePictureAsync(options)
  setCapturePhoto(data.uri)

  //Chama a função salvar foto no album
  savePicture(data.uri)
 }

 //Verifica, checa permissao e requisita permissão passando granted('permitido')
 async function hasAndroidPermission(){
   const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE

   const hasPermission = await PermissionsAndroid.check(permission)

   if(hasPermission){
     return true
   }

   const status = await PermissionsAndroid.request(permission)
   return status === 'granted'
 }

 //Salva foto
 async function savePicture(data){

  if(Platform.OS === 'android' && !(await hasAndroidPermission())){
    return
  }

  CameraRoll.save(data, 'photo')
  .then(res => {
    console.log('SALVO COM SUCESSO, ' + res)
  })
  .catch(error => {
    console.log('Error: ' + error)
  })

 }

 function toggleCam(){
   setType(type === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back)
 }

 function openAlbum(){
  const options = {
    title: 'Selecione uma foto',
    chooseFromLibraryButtonTitle: 'Buscar foto do album..',
    noData: true,
    mediaType: 'photo'
  };

  ImagePicker.launchImageLibrary(options, response => {

    if(response.didCancel){
      console.log('Image Picker cancelado...');
    }else if(response.errorMessage){
      console.log('Gerou algum erro: ' + response.error);
    }else{
      console.log('caiu no else')
      setCapturePhoto(response.assets[0].uri);
      setOpen(true);
    }

  })
 }

 return (
   <View style={style.container}>
     <StatusBar hidden={true}/>
     
      <RNCamera
        style={style.preview}
        type={type}
        flashMode={RNCamera.Constants.FlashMode.auto}
        androidCameraPermissionOptions={{
          title: 'Permissão para usar a câmera',
          message: 'Nós precisamos usar a sua câmera',
          buttonPositive: 'Permitir',
          buttonNegative: 'Cancelar'
        }}
      >
        {({camera, status, recordAndroidPermissionStatus}) => {
          if(status !== 'READY') return <View/>

          return(
            <View style={{
              marginBottom: 35,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between'
            }}>

              <TouchableOpacity
                onPress={() => takePicture(camera)}
                style={style.capture}
              >
                <Text>Tirar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openAlbum}
                style={style.capture}
              >
                <Text>Album</Text>
              </TouchableOpacity>

            </View>
          )
        }}
      </RNCamera>

      <View style={style.camPosition}>
        <TouchableOpacity onPress={toggleCam}>
          <Text>Trocar</Text>
        </TouchableOpacity>
      </View>

      {capturePhoto && 
          <Modal
            animationType='slide'
            transparent={false}
            visible={open}
          >
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20}}>
              
              <TouchableOpacity style={{margin: 15}} onPress={() => setOpen(false)}>
                <Text style={{fontSize: 24}}>Fechar</Text>
              </TouchableOpacity>
            
            <Image 
              resizeMode='contain'
              style={{width: 350, height: 450, borderRadius: 15}}
              source={{uri: capturePhoto}}
            />
            
          </View>
        </Modal>
      }

   </View>
  );
}

const style = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'center'
  },
  preview:{
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture:{
    flex: 0,
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginHorizontal: 10

  },
  camPosition:{
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 10,
    height: 40,
    position: 'absolute',
    right: 25,
    top: 60
  }
})