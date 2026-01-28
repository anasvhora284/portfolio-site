import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Layout from "../../components/Layout/Layout";
import ContactForm from "../../components/Contact/ContactForm";
import ContactBackground from "../../components/Contact/ContactBackground";
import "./ContactPage.css";

const ContactPage = () => {
  return (
    <Layout>
      <div className="contact-page-container">
        <div className="contact-background">
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <Suspense fallback={null}>
              <ContactBackground />
            </Suspense>
          </Canvas>
        </div>
        <ContactForm />
      </div>
    </Layout>
  );
};

export default ContactPage;
