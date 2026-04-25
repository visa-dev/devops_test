package lk.ourgym.service;

import lk.ourgym.model.Batch;
import lk.ourgym.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class BatchService {
    
    private final BatchRepository batchRepository;
    
    public List<Batch> getAll() {
        return batchRepository.getActiveBatches();
    }
    
    public Batch getById(Long id) {
        return batchRepository.findById(id).orElse(null);
    }
    
    public Batch save(Batch batch) {
        if (batch.getId() == null) {
            batch.setAddeddatetime(LocalDateTime.now());
        }
        batch.setUpdateddatetime(LocalDateTime.now());
        return batchRepository.save(batch);
    }
    
    public Batch update(Long id, Batch batch) {
        Batch existing = getById(id);
        if (existing != null) {
            existing.setName(batch.getName());
            existing.setDescription(batch.getDescription());
            existing.setSchedule(batch.getSchedule());
            existing.setMaxCapacity(batch.getMaxCapacity());
            existing.setStatus(batch.getStatus());
            existing.setTrainerType(batch.getTrainerType());
            existing.setUpdateddatetime(LocalDateTime.now());
            return batchRepository.save(existing);
        }
        return null;
    }
    
    public void delete(Long id) {
        Batch batch = getById(id);
        if (batch != null) {
            batch.setDeleteddatetime(LocalDateTime.now());
            batchRepository.save(batch);
        }
    }
}
