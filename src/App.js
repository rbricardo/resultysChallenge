import React, { Component } from "react";
import axios from "axios";
import { 
  Button, 
  Table, 
  Card,
  CardTitle, 
  CardText 
} from 'reactstrap';
import Modal from 'react-modal';

const modalStyle = {
  content : {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    height: '500px', // <-- This sets the height
    overlfow: 'scroll' // <-- This tells the modal to scrol
  
  }
};

export default class App extends Component {
  
  state = {
    data: [],
    placeId: '',
    cep: '',
    latitude: [],
    longitude: '',
    name: '',
    modalIsOpen: false,
    dataModal: [],
  };

  openModal() {
    this.setState({modalIsOpen: true});
  }
  closeModal() {
    this.setState({modalIsOpen: false});
  }

  openDetails = (id) => {
    axios({
      method: "get",
      crossDomain: true,
      url:
        "https://maps.googleapis.com/maps/api/place/details/json?placeid="+ id +"&key=AIzaSyBsu0mUGK-YCTVnhpQvnWbtJoSJcXHVi3w",
    })
    .then(response => {
  
      this.setState({dataModal: response.data.result})
    })
    .catch(error => {
      console.log(error);
    });
  }

  searchCep = () => {
    axios({
      method: "get",
      crossDomain: true,
      url:
        "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + this.state.cep + "&key=AIzaSyBsu0mUGK-YCTVnhpQvnWbtJoSJcXHVi3w",
    })
    .then(response => {
      this.setState({ latitude: response.data.results[0].geometry.location.lat, longitude: response.data.results[0].geometry.location.lng })
      axios({
        method: "get",
        crossDomain: true,
        url:
          "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+ this.state.latitude + ","+ this.state.longitude +"&radius=500&key=AIzaSyBsu0mUGK-YCTVnhpQvnWbtJoSJcXHVi3w",
      })
      .then(response => {

        this.setState({ data: response.data.results })

      })
      .catch(error => {
        console.log(error);
      });
    })
    .catch(error => {
      console.log(error);
    });
  };

  renderModal = () => (
    <Modal
      isOpen={this.state.modalIsOpen}
      // onAfterOpen={this.afterOpenModal}
      onRequestClose={() => this.closeModal()}
      ariaHideApp={false}
      style={modalStyle}
      contentLabel="Example Modal"
    >
    
      <h3 style={{textAlign: 'center'}}>Detalhes do Estabelecimento</h3>
      <Table dark>
        <thead>
          <tr>
            <th>Nome do Estabelecimento</th>
            <th>Nota</th>
            <th>Telefone</th>
          </tr>
        </thead>
      
        <tbody>
          <tr>
            <td>{this.state.dataModal.name}</td>
            <td>{this.state.dataModal.rating}</td>
            <td>{this.state.dataModal.formatted_phone_number}</td>
          </tr>
        </tbody>
      </Table>
      <Table dark>
        <thead>
          <tr>
            <th>Endereço</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{this.state.dataModal.formatted_address}</td>
          </tr>
        </tbody>
      </Table> 
      <h3 style={{textAlign: 'center'}}>Feedbacks de clientes</h3>
      
      {
        this.state.dataModal.length === 0 ? 
        console.log('0') : 
        this.state.dataModal.reviews.length === 0 ? 
        console.log('0') : 
        this.state.dataModal.reviews.map((review, k) => (
          <div key={k}>
            <Card body inverse style={{ backgroundColor: '#333', borderColor: '#333' }}>
              <CardTitle>{review.author_name}</CardTitle>
              <CardText>{review.text}</CardText>
              <CardText style={{fontWeight: 'bold'}}>Nota: {review.rating}</CardText>
            </Card>
          </div>
        ))
      }
        
    </Modal>
  )
  
  render() {
    return (
      <div>
        <div>
          <h1>Digite o CEP</h1>
          <br />
          <input
            value={this.state.cep}
            onChange={event => this.setState({ cep: event.target.value })}
          />
          <br />
          <Button color="primary" onClick={() => {this.searchCep()}}>Pesquisar</Button>
          <Table dark>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome do Estabelecimento</th>
                <th>Nota atribuída</th>
              </tr>
            </thead>
            <tbody>
              { this.state.data ?
                Object.values(this.state.data).map((res, key) => (
                <tr key={key}>
                  <th scope="row">{key+1}</th>
                  <td>{res.name}</td>
                  <td>{res.rating}</td>
                  <td>{
                        res.rating ?
                        <Button onClick={() => {this.openDetails(res.place_id); this.openModal()}}>Mais detalhes</Button> :
                        <Button disabled={true}>Mais detalhes</Button>
                      }
                  </td>
                </tr>
              )) : null}
            </tbody>
          </Table>         
        </div>
        {this.renderModal()}
      </div>
    );
  }
}
