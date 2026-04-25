package lk.ourgym.service;

import lk.ourgym.model.Class;
import lk.ourgym.repository.ClassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ClassService {
    
    private final ClassRepository classRepository;
    
    public List<Class> getAll() {
        return classRepository.getActiveClasses();
    }
    
    public Class getById(Long id) {
        return classRepository.findById(id).orElse(null);
    }
    
    public Class save(Class classEntity) {
        if (classEntity.getId() == null) {
            classEntity.setAddeddatetime(LocalDateTime.now());
        }
        classEntity.setUpdateddatetime(LocalDateTime.now());
        return classRepository.save(classEntity);
    }
    
    public Class update(Long id, Class classEntity) {
        Class existing = getById(id);
        if (existing != null) {
            existing.setName(classEntity.getName());
            existing.setDescription(classEntity.getDescription());
            existing.setSchedule(classEntity.getSchedule());
            existing.setMaxCapacity(classEntity.getMaxCapacity());
            existing.setStatus(classEntity.getStatus());
            existing.setTrainerType(classEntity.getTrainerType());
            existing.setUpdateddatetime(LocalDateTime.now());
            return classRepository.save(existing);
        }
        return null;
    }
    
    public void delete(Long id) {
        Class classEntity = getById(id);
        if (classEntity != null) {
            classEntity.setDeleteddatetime(LocalDateTime.now());
            classRepository.save(classEntity);
        }
    }
}
